// app/(main)/transaction/create/page.jsx
import AddTransactionForm from "../_components/AddTransactionForm";
import { getUserAccounts, getTransaction } from "../../../../actions/transactions";
import { currentUser } from "@clerk/nextjs/server";

export default async function AddTransactionPage({ searchParams }) {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="text-center mt-20 text-lg text-red-500">
        Please sign in to add a transaction.
      </div>
    );
  }

  const editId = searchParams?.edit;

  // Fetch accounts and initial transaction in parallel
  const [accounts, initialData] = await Promise.all([
    getUserAccounts(user.id),
    editId ? getTransaction(editId) : Promise.resolve(null),
  ]);

  // If user has no accounts, show message
  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center mt-20 text-lg text-red-500">
        You don't have any accounts. Please create an account first.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-8">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm
        accounts={accounts}
        editMode={!!editId}
        initialData={initialData}
        userId={user.id}
      />
    </div>
  );
}
