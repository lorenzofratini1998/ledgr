import { Receipt } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';

interface TransactionListItemProps {
  transaction: {
    transaction_id: string;
    description: string;
    date: string;
    amount: number;
    normalized_amount: number;
    currency_code: string;
    wallets?: { name: string; color?: string } | null;
    categories?: { category_name: string; color?: string; icon?: string } | null;
  };
  dateFormatPreference?: string;
  locale?: string;
}

export function TransactionListItem({ transaction: tx, dateFormatPreference = 'DD/MM/YYYY', locale = 'en-US' }: TransactionListItemProps) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
      <div className="flex items-center space-x-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" 
          style={{ backgroundColor: tx.categories?.color || '#94a3b8' }}
        >
          <Receipt size={20} />
        </div>
        <div>
          <p className="font-medium leading-none">{tx.description}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(tx.date, dateFormatPreference)} • {tx.wallets?.name || 'Unknown Wallet'}
          </p>
        </div>
      </div>
      <div className={`font-semibold ${tx.normalized_amount > 0 ? 'text-emerald-500' : ''}`}>
        {tx.normalized_amount > 0 ? '+' : ''}
        {formatCurrency(tx.amount, tx.currency_code, locale)}
      </div>
    </div>
  );
}
