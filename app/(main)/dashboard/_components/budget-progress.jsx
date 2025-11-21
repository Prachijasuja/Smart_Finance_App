"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Trash2, Plus } from "lucide-react";
import useFetch from "../../../../hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

import { updateBudget } from "../../../../actions/budgets";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../../../../actions/transactions";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  // --- State ---
  const [budget, setBudget] = useState(initialBudget);
  const [expenses, setExpenses] = useState(currentExpenses || 0);
  const [transactions, setTransactions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "EXPENSE", // default type
  });

  // --- Hooks ---
  const {
    loading: isBudgetLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error: budgetError,
  } = useFetch(updateBudget);

  const {
    fn: fetchTransactionsFn,
    data: transactionData,
    loading: transactionsLoading,
  } = useFetch(getTransactions);

  const { fn: addTransactionFn, data: addedTx } = useFetch(createTransaction);
  const { fn: deleteTransactionFn, data: deletedTx } =
    useFetch(deleteTransaction);

  // --- Calculations ---
  const percentUsed =
    budget && budget.amount > 0 ? (expenses / budget.amount) * 100 : 0;

  // --- Handlers ---
  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(budget?.amount?.toString() || "");
    setIsEditing(false);
  };

  const handleAddTransaction = async () => {
    const amount = parseFloat(newTransaction.amount);
    if (!newTransaction.description || isNaN(amount) || amount <= 0) {
      toast.error("Please enter valid transaction details");
      return;
    }

    await addTransactionFn({
      accountId: budget?.accountId || "default",
      type: newTransaction.type,
      category: "General",
      amount,
      date: new Date(),
      description: newTransaction.description,
    });
  };

  const handleDeleteTransaction = async (id) => {
    await deleteTransactionFn(id);
  };

  // --- Effects ---

  // Refresh budget after update
  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
      setBudget(updatedBudget.data);
    }
  }, [updatedBudget]);

  // Handle budget errors
  useEffect(() => {
    if (budgetError) {
      toast.error(budgetError.message || "Failed to update budget");
    }
  }, [budgetError]);

  // Load transactions on mount
  useEffect(() => {
    fetchTransactionsFn();
  }, []);

  // Update transactions + recalc expenses
  useEffect(() => {
    if (transactionData?.success) {
      setTransactions(transactionData.data);
      const total = transactionData.data
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      setExpenses(total);
    }
  }, [transactionData]);

  // On transaction add
  useEffect(() => {
    if (addedTx?.success) {
      toast.success("Transaction added");
      setTransactions((prev) => [...prev, addedTx.transaction]);
      if (addedTx.transaction.type === "EXPENSE") {
        setExpenses((prev) => prev + Number(addedTx.transaction.amount));
      }
      setNewTransaction({ description: "", amount: "", type: "EXPENSE" });
    }
  }, [addedTx]);

  // On transaction delete
  useEffect(() => {
    if (deletedTx?.success) {
      toast.success("Transaction deleted");
      setTransactions((prev) =>
        prev.filter((t) => t.id !== deletedTx.data.id)
      );
      if (deletedTx.data.type === "EXPENSE") {
        setExpenses((prev) => prev - Number(deletedTx.data.amount));
      }
    }
  }, [deletedTx]);

  // --- Progress color ---
  const progressColor =
    percentUsed >= 90
      ? "bg-red-500"
      : percentUsed >= 75
      ? "bg-yellow-500"
      : "bg-green-500";

  // --- UI ---
  return (
    <div className="grid gap-6">
      {/* --- Budget Card --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              Monthly Budget (Default Account)
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-32"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isBudgetLoading}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleUpdateBudget}
                    disabled={isBudgetLoading}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    disabled={isBudgetLoading}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <CardDescription>
                    ${expenses.toFixed(2)} of $
                    {budget?.amount?.toFixed(2) ?? "0.00"} spent
                  </CardDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {/* ✅ FIXED PROGRESS COLOR */}
            <Progress
              value={budget?.amount > 0 ? percentUsed : 0}
              className={`h-2 ${progressColor}`}
            />
            <p className="text-xs text-muted-foreground text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- Transactions Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Transaction */}
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Description"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  amount: e.target.value,
                })
              }
            />
            <Button size="icon" onClick={handleAddTransaction}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {transactionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border-b py-1"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      ${Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTransaction(tx.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
