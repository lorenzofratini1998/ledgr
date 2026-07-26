import { fetchRecentTransactionsAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Receipt } from 'lucide-react';
import { getTranslator } from '@/i18n/server';
import { formatDate } from '@/lib/formatters';

import { formatCurrency } from '@/lib/formatters';

export async function RecentTransactionsWidget({ walletId, categoryId, dateFormatPreference = 'DD/MM/YYYY', locale = 'en-US' }: { walletId?: string, categoryId?: string, dateFormatPreference?: string, locale?: string }) {
  const res = await fetchRecentTransactionsAction(5, walletId, categoryId);
  const transactions = res.success && res.data ? res.data : [];
  const { t } = await getTranslator();

  return (
    <WidgetCard 
      title={<span className="text-lg font-semibold">{t('dashboard.widgets.recent_transactions')}</span>}
      className="col-span-full"
      headerClassName="pb-4"
      headerRight={
        <Link href={`/transactions?${new URLSearchParams({
          ...(walletId ? { wallets: walletId } : {}),
          ...(categoryId ? { categories: categoryId } : {})
        }).toString()}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
           <Receipt className="mx-auto h-8 w-8 mb-2 opacity-20" />
           <p>{t('dashboard.widgets.no_transactions')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx: any) => (
            <div key={tx.transaction_id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
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
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

export function RecentTransactionsWidgetSkeleton() {
  return (
    <WidgetCardSkeleton className="col-span-full" headerClassName="pb-4">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
           <div key={i} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
              <div className="flex space-x-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-muted"></div>
                 <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                 </div>
              </div>
              <div className="h-5 w-16 bg-muted rounded"></div>
           </div>
        ))}
      </div>
    </WidgetCardSkeleton>
  );
}
