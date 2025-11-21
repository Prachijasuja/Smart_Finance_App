"use server"; // IMPORTANT: marks this file as server-only
import { db } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";

const serialize = (obj) => {
  const copy = { ...obj };
  if (copy.balance?.toNumber) copy.balance = copy.balance.toNumber();
  if (copy.amount?.toNumber) copy.amount = copy.amount.toNumber();
  return copy;
};

// Get all user accounts
export async function getUserAccounts() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(serialize);
}

// Get single transaction
export async function getTransaction(id) {
  return await db.transaction.findUnique({ where: { id } });
}

// Create transaction and update account balance
export async function createTransaction({ accountId, type, category, amount, date, description }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const parsedAmount = parseFloat(amount);

  const tx = await db.$transaction(async (prisma) => {
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId,
        type,
        category,
        amount: parsedAmount,
        date: new Date(date),
        description,
        status: "COMPLETED",
      },
    });

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    const newBalance = type === "INCOME" ? account.balance + parsedAmount : account.balance - parsedAmount;

    await prisma.account.update({ where: { id: accountId }, data: { balance: newBalance } });

    return transaction;
  });

  return { success: true, transaction: tx };
}
export async function updateTransaction({ id, accountId, type, category, amount, date, description }) {
  const transaction = await db.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  // Revert previous account balance
  const oldAccount = await db.account.findUnique({ where: { id: transaction.accountId } });
  const revertedBalance =
    transaction.type === "INCOME" ? oldAccount.balance - transaction.amount : oldAccount.balance + transaction.amount;

  await db.account.update({ where: { id: transaction.accountId }, data: { balance: revertedBalance } });

  // Update transaction
  const updatedTx = await db.transaction.update({
    where: { id },
    data: {
      accountId,
      type,
      category,
      amount: parseFloat(amount),
      date: new Date(date),
      description,
    },
  });

  // Update new account balance
  const newAccount = await db.account.findUnique({ where: { id: accountId } });
  const newBalance = type === "INCOME" ? newAccount.balance + parseFloat(amount) : newAccount.balance - parseFloat(amount);
  await db.account.update({ where: { id: accountId }, data: { balance: newBalance } });

  return { success: true, transaction: updatedTx };
}
// Get all transactions for the current user (used in BudgetProgress)
export async function getTransactions() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return { success: true, data: transactions.map((t) => serialize(t)) };
}

// Delete a transaction and update account balance
export async function deleteTransaction(id) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  const transaction = await db.transaction.findUnique({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  const account = await db.account.findUnique({ where: { id: transaction.accountId } });
  const newBalance =
    transaction.type === "INCOME"
      ? account.balance - transaction.amount
      : account.balance + transaction.amount;

  await db.$transaction([
    db.account.update({ where: { id: transaction.accountId }, data: { balance: newBalance } }),
    db.transaction.delete({ where: { id } }),
  ]);

  return { success: true, data: serialize(transaction) };
}
