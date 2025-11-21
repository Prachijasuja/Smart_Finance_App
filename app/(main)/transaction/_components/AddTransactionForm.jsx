"use client";

import React, { useState } from "react";
import { createTransaction, updateTransaction } from "../../../../actions/transactions";
import ReceiptUpload from "./ReceiptUpload";

export default function AddTransactionForm({ accounts, editMode, initialData, userId }) {
  const [selectedAccount, setSelectedAccount] = useState(initialData?.accountId || accounts[0]?.id || "");
  const [type, setType] = useState(initialData?.type || "EXPENSE");
  const [category, setCategory] = useState(initialData?.category || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().substr(0, 10) : new Date().toISOString().substr(0, 10)
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && initialData?.id) {
        await updateTransaction({
          id: initialData.id,
          accountId: selectedAccount,
          type,
          category,
          amount,
          date,
          description,
        });
        alert("Transaction updated successfully!");
      } else {
        await createTransaction({
          accountId: selectedAccount,
          type,
          category,
          amount,
          date,
          description,
        });
        alert("Transaction added successfully!");
        // reset form
        setType("EXPENSE");
        setCategory("");
        setAmount("");
        setDate(new Date().toISOString().substr(0, 10));
        setDescription("");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-md">

      {/* Smart Receipt Scanner */}
      <ReceiptUpload
        onParsed={(tx) => {
          setAmount(tx.amount || "");
          setDate(tx.date || new Date().toISOString().substr(0, 10));
          setCategory(tx.category || "");
          setDescription(tx.description || "");
        }}
      />

      {/* Account Selection */}
      <div>
        <label className="block font-medium">Account</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="border p-2 rounded w-full"
          required
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} (Balance: {acc.balance})
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Type */}
      <div>
        <label className="block font-medium">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded w-full">
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block font-medium">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block font-medium">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {editMode ? "Update Transaction" : "Add Transaction"}
      </button>
    </form>
  );
}
