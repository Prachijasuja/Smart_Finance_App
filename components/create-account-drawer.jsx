"use client";
import React, { useState } from "react";
import "./CreateAccountDrawer.css";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

const CreateAccountDrawer = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    isDefault: false,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setError(null);
    setSuccess(null);

    try {
      // ✅ Validate using Zod schema
      const validatedData = accountSchema.parse(formData);

      // ✅ Call backend/server action
      const result = await createAccount(validatedData);

      if (result?.success) {
        setSuccess("Account created successfully!");
        setOpen(false);
        setFormData({
          name: "",
          type: "",
          balance: "",
          isDefault: false,
        });
      } else {
        setError(result?.message || "Failed to create account.");
      }
    } catch (err) {
      // Catch validation or server error
      console.error(err);
      setError(err.message || "Validation failed.");
    }
  };

  return (
    <>
      <button className="drawer-button" onClick={() => setOpen(true)}>
        {children}
      </button>

      {open && (
        <div className="drawer-overlay" onClick={() => setOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">Create New Account</h2>
              <button className="drawer-close" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <form className="drawer-form" onSubmit={handleSubmit}>
              <label>
                Account Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Account Type
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="CURRENT">Current</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </label>

              <label>
                Initial Balance
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                Set as Default
              </label>

              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}

              <div className="drawer-actions">
                <button type="button" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateAccountDrawer;
