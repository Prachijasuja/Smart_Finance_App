"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getUserAccount } from "../../../actions/dashboard";
import { getCurrentBudget } from "../../../actions/budgets";
import AccountCard from "./_components/account-card";
import CreateAccountDrawer from "../../../components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "../../../components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser(); // 👈 client-side user
  const [accounts, setAccounts] = useState([]);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      const acc = await getUserAccount(user.id);
      setAccounts(acc);

      const defaultAccount = acc.find(a => a.isDefault);
      if (defaultAccount) {
        const budget = await getCurrentBudget(defaultAccount.id);
        setBudgetData(budget);
      }
    }

    fetchData();
  }, [user]);

  if (!user) return <div>Please sign in to view the dashboard.</div>;
  if (!accounts.length) return (
    <div className="p-8 text-center">
      <p>No accounts found. Add one to get started!</p>
      <CreateAccountDrawer>
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed mt-4">
          <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
            <Plus className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">Add New Account</p>
          </CardContent>
        </Card>
      </CreateAccountDrawer>
    </div>
  );

  return (
    <div className="space-y-8 p-4">
      {budgetData && (
        <BudgetProgress
          initialBudget={budgetData.budget}
          currentExpenses={budgetData.currentExpenses || 0}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.map(account => (
          <Link key={account.id} href={`/account/${account.id}`}>
            <AccountCard account={account} />
          </Link>
        ))}
      </div>
    </div>
  );
}
