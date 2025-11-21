"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../../components/ui/card";
import { Switch } from "../../../../components/ui/switch";
import { toast } from "sonner";
import useFetch from "../../../../hooks/use-fetch";
import { updateDefaultAccount } from "../../../../actions/accounts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AccountChart({ account, transactions = [] }) {
  if (!account) return null;

  const { name, type, balance, id, isDefault } = account;
  const { loading, fn: updateDefaultFn, data: updatedAccount, error } = useFetch(updateDefaultAccount);

  // Local state to update chart dynamically
  const [localTransactions, setLocalTransactions] = useState(transactions);

  const handleDefaultChange = async (e) => {
    e.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) toast.success("Default account updated successfully");
  }, [updatedAccount]);

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to update default account");
  }, [error]);

  // Sort all transactions by date (no accountId filter)
  const sortedTransactions = [...localTransactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Prepare labels (YYYY-MM-DD for consistency)
  const labels = Array.from(new Set(
    sortedTransactions.map(t => new Date(t.date).toISOString().split("T")[0])
  ));

  // Map data by date
  const incomeData = labels.map(label =>
    sortedTransactions
      .filter(t => t.type === "INCOME" && new Date(t.date).toISOString().split("T")[0] === label)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const expenseData = labels.map(label =>
    sortedTransactions
      .filter(t => t.type === "EXPENSE" && new Date(t.date).toISOString().split("T")[0] === label)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "rgba(34,197,94,0.8)",
        borderRadius: 6,
        barThickness: 20,
      },
      {
        label: "Expense",
        data: expenseData,
        backgroundColor: "rgba(239,68,68,0.8)",
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: context => `$${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        title: { display: true, text: "Date" },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: { callback: v => `$${v}` },
        title: { display: true, text: "Amount" },
      },
    },
  };

  return (
    <Card className="hover:shadow-lg transition-shadow group relative">
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
        <Switch checked={isDefault} onClick={handleDefaultChange} disabled={loading} />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold mb-2">${parseFloat(balance).toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mb-4">{type.charAt(0) + type.slice(1).toLowerCase()} Account</p>

        {sortedTransactions.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className="text-center text-muted-foreground"></p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" /> Income
        </div>
        <div className="flex items-center">
          <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" /> Expense
        </div>
      </CardFooter>
    </Card>
  );
}
