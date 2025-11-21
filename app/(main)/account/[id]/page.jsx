import { Suspense } from "react";
import { getAccountWithTransactions } from "../../../../actions/accounts";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../../dashboard/_components/account-card";
import { notFound } from "next/navigation";
import { BarLoader } from "react-spinners";
import AccountAnalytics from "../../dashboard/_components/AccountAnalytics";

export default async function AccountPage({ params }) {
  const accountId = params?.id;
  if (!accountId) notFound();

  const accountData = await getAccountWithTransactions(accountId);
  if (!accountData) notFound();

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-bold capitalize">{account.name}</h1>
          <p>{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
        </div>
        <div className="text-right">
          <p>${parseFloat(account.balance ?? 0).toFixed(2)}</p>
          <p>{account._count?.transactions ?? 0} Transactions</p>
        </div>
      </div>

      <Suspense fallback={<BarLoader width="100%" color="#9333ea" />}>
        <AccountChart account={account} transactions={transactions} />
      </Suspense>
      <Suspense fallback={<BarLoader width="100%" color="#9333ea" />}>
  <AccountAnalytics account={account} transactions={transactions} />
</Suspense>


      <Suspense fallback={<BarLoader width="100%" color="#9333ea" />}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
