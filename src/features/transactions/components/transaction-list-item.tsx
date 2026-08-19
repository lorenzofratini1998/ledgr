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
    <div className="flex items-center justify-between border-b border-border/50 last:border-0 pb-3 sm:pb-4 last:pb-0 gap-2">
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs" 
          style={{ backgroundColor: tx.categories?.color || '#94a3b8' }}
        >
          <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium leading-none truncate">{tx.description}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
            {formatDate(tx.date, dateFormatPreference)} • {tx.wallets?.name || 'Unknown Wallet'}
          </p>
        </div>
      </div>
      <div className={`text-xs sm:text-sm font-bold tracking-tight shrink-0 ${tx.normalized_amount > 0 ? 'text-emerald-500' : ''}`}>
        {tx.normalized_amount > 0 ? '+' : ''}
        {formatCurrency(tx.amount, tx.currency_code, locale)}
      </div>
    </div>
  );
}

