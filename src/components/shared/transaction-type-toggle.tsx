import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TransactionTypeToggleProps {
  value: 'income' | 'expense';
  onValueChange: (value: 'income' | 'expense') => void;
  className?: string;
}

export function TransactionTypeToggle({ value, onValueChange, className }: TransactionTypeToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as 'income' | 'expense')} className={className || "w-full"}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
          Expense
        </TabsTrigger>
        <TabsTrigger value="income" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500">
          Income
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
