"use client";

import { Pie, Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AccountAnalytics({ account, transactions = [] }) {
  if (!account) return null;

  // ----- Pie chart: Expense by category -----
  const expenseTransactions = transactions.filter(t => t.type === "EXPENSE");
  const expenseByCategory = {};
  expenseTransactions.forEach(t => {
    if (expenseByCategory[t.category]) expenseByCategory[t.category] += t.amount;
    else expenseByCategory[t.category] = t.amount;
  });
  const pieLabels = Object.keys(expenseByCategory);
  const pieData = Object.values(expenseByCategory);

  const pieChartData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieData,
        backgroundColor: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"],
      },
    ],
  };

  // ----- Bar chart: Income vs Expense over time -----
  const dates = Array.from(new Set(transactions.map(t => new Date(t.date).toLocaleDateString())));
  const incomeData = dates.map(date =>
    transactions
      .filter(t => t.type === "INCOME" && new Date(t.date).toLocaleDateString() === date)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const expenseData = dates.map(date =>
    transactions
      .filter(t => t.type === "EXPENSE" && new Date(t.date).toLocaleDateString() === date)
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const barChartData = {
    labels: dates,
    datasets: [
      { label: "Income", data: incomeData, backgroundColor: "rgba(34,197,94,0.8)" },
      { label: "Expense", data: expenseData, backgroundColor: "rgba(239,68,68,0.8)" },
    ],
  };

  // ----- Line chart: Balance over time -----
  let balance = account.balance;
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const runningBalances = sortedTransactions.map(t => {
    balance += t.type === "INCOME" ? t.amount : -t.amount;
    return { date: new Date(t.date).toLocaleDateString(), balance };
  });
  const lineLabels = runningBalances.map(b => b.date);
  const lineData = runningBalances.map(b => b.balance);
  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: "Balance",
        data: lineData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="bg-white rounded-lg shadow p-4 h-96 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Expense by Category</h2>
        <div className="flex-1">
          <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4 h-96 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Income vs Expense Over Time</h2>
        <div className="flex-1">
          <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg shadow p-4 h-96 flex flex-col md:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Balance Trend</h2>
        <div className="flex-1">
          <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

