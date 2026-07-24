"use client";

import { DataTable, TransactionRow } from "./data-table";
import { columns } from "./columns";

interface TransactionsClientViewProps {
  transactions: TransactionRow[];
  totalCount: number;
  currentPage: number;
  wallets: any[];
  categories: any[];
  tags: any[];
  currencies: any[];
  primaryCurrencyCode: string;
}

export function TransactionsClientView({ 
  transactions, 
  totalCount, 
  currentPage,
  wallets,
  categories,
  tags,
  currencies,
  primaryCurrencyCode
}: TransactionsClientViewProps) {
  return (
    <div className="mt-8 pb-32">
      <DataTable 
        columns={columns} 
        data={transactions} 
        totalCount={totalCount}
        currentPage={currentPage}
        wallets={wallets}
        categories={categories}
        tags={tags}
        currencies={currencies}
        primaryCurrencyCode={primaryCurrencyCode}
      />
    </div>
  );
}
