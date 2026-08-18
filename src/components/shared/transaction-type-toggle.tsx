'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n/hooks/use-translation';

interface TransactionTypeToggleProps {
  value: 'income' | 'expense' | 'transfer';
  onValueChange: (value: 'income' | 'expense' | 'transfer') => void;
  className?: string;
}

export function TransactionTypeToggle({ value, onValueChange, className }: TransactionTypeToggleProps) {
  const { t } = useTranslation();

  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as 'income' | 'expense' | 'transfer')} className={className || "w-full"}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
          {t('transactions.expense')}
        </TabsTrigger>
        <TabsTrigger value="income" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500">
          {t('transactions.income')}
        </TabsTrigger>
        <TabsTrigger value="transfer" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
          {t('transactions.transfer')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

