"use server";

import nodemailer from "nodemailer";
import { db } from "../lib/prisma";

// Serialize decimals for safety
const serialize = (obj) => {
  const copy = { ...obj };
  if (copy.amount?.toNumber) copy.amount = copy.amount.toNumber();
  if (copy.balance?.toNumber) copy.balance = copy.balance.toNumber();
  return copy;
};

// Set up SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send email
async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

// Check budgets and send alerts
export async function checkAndSendBudgetAlerts() {
  // Get all users with budgets
  const users = await db.user.findMany({
    include: {
      budgets: true,
      transactions: true, // fetch transactions for calculation
    },
  });

  for (const user of users) {
    if (!user.budgets.length) continue;

    const budget = user.budgets[0]; // Assuming 1 budget per user
    const budgetAmount = serialize(budget).amount;

    // Sum total EXPENSE transactions
    const totalSpent = user.transactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + serialize(tx).amount, 0);

    const spentPercent = ((totalSpent / budgetAmount) * 100).toFixed(0);

    const thresholds = [50, 70, 90, 100];

    // Only send email once per day per threshold
    if (
      thresholds.includes(Number(spentPercent)) &&
      (!budget.lastAlertSent ||
        new Date(budget.lastAlertSent).toDateString() !== new Date().toDateString())
    ) {
      const subject = `Budget Alert: ${spentPercent}% spent!`;
      const text = `Hi ${user.name || "User"},\n\nYou have spent ${spentPercent}% of your budget (${budgetAmount}).\n\nPlease review your spending.`;

      await sendEmail(user.email, subject, text);

      // Update last alert sent
      await db.budget.update({
        where: { id: budget.id },
        data: { lastAlertSent: new Date() },
      });
    }
  }
}
