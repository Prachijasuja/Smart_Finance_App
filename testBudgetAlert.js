import { db } from "./lib/prisma";
import { createTransaction } from "./actions/transactions";
import { checkAndSendBudgetAlerts } from "./actions/budgetAlerts";

async function testBudgetAlert() {
  // Pick a user and account from your database
  const user = await db.user.findFirst();
  const account = await db.account.findFirst({ where: { userId: user.id } });
  const budget = await db.budget.findFirst({ where: { userId: user.id } });

  if (!user || !account || !budget) {
    console.log("Please create a user, account, and budget first.");
    return;
  }

  console.log("User, account, and budget found:", user.email);

  // Add a transaction to exceed a threshold
  await createTransaction({
    accountId: account.id,
    type: "EXPENSE",
    category: "Test",
    amount: parseFloat(budget.amount) * 0.6, // 60% of budget
    date: new Date(),
    description: "Test transaction for budget alert",
  });

  // Run the budget alert check
  await checkAndSendBudgetAlerts();

  console.log("Budget alert check completed. Check your email.");
}

testBudgetAlert()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
