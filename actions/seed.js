"use server";

import { db } from "../lib/prisma";
import { subDays } from "date-fns";

// Constants for enum values (match your Prisma schema)
const ACCOUNT_TYPE_CURRENT = "CURRENT"; // valid AccountType
const ACCOUNT_TYPE_SAVINGS = "SAVINGS";

const TRANSACTION_TYPE_INCOME = "INCOME";
const TRANSACTION_TYPE_EXPENSE = "EXPENSE";

// Categories with amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helpers
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// Main seed function
export async function seedTransactions() {
  try {
    // Ensure user exists
    const user = await db.user.upsert({
      where: { clerkUserId: "user_33e4JPg1hlY2eazFiFNMIoPhBUI" },
      update: {},
      create: {
        clerkUserId: "user_33e4JPg1hlY2eazFiFNMIoPhBUI",
        email: "prachijasuj520@example.com",
        name: "Prachi Jasuja",
        imageUrl: "https://placehold.co/100x100",
      },
    });

    // Ensure account exists
    const account = await db.account.upsert({
      where: { id: "6ea9a952-9f7b-41ce-bbf8-bbb024bd43c2" },
      update: {},
      create: {
        id: "6ea9a952-9f7b-41ce-bbf8-bbb024bd43c2",
        name: "Current Account",
        type: ACCOUNT_TYPE_CURRENT, // must match Prisma schema
        balance: 0,
        isDefault: true,
        userId: user.id,
      },
    });

    // Generate transactions
    const transactions = [];
    let totalBalance = 0;

    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? TRANSACTION_TYPE_INCOME : TRANSACTION_TYPE_EXPENSE;
        const { category, amount } = getRandomCategory(type === TRANSACTION_TYPE_INCOME ? "INCOME" : "EXPENSE");

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === TRANSACTION_TYPE_INCOME ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === TRANSACTION_TYPE_INCOME ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions and update account balance
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { accountId: account.id } });
      await tx.transaction.createMany({ data: transactions });
      await tx.account.update({ where: { id: account.id }, data: { balance: totalBalance } });
    });

    return { success: true, message: `Created ${transactions.length} transactions` };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

