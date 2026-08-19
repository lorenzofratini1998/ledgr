import { fetchRecentTransactionsAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Receipt } from 'lucide-react';
import { getTranslator } from '@/i18n/server';
import { TransactionListItem } from '@/features/transactions/components/transaction-list-item';

export async function RecentTransactionsWidget({ walletId, categoryId, recurringId, dateFormatPreference = 'DD/MM/YYYY', locale = 'en-US' }: { walletId?: string, categoryId?: string, recurringId?: string, dateFormatPreference?: string, locale?: string }) {
  const res = await fetchRecentTransactionsAction(5, walletId, categoryId, recurringId);
  const transactions = res.success && res.data ? res.data : [];
  const { t } = await getTranslator();

  return (
    <WidgetCard 
      title={<span className="text-sm sm:text-base font-semibold">{t('dashboard.widgets.recent_transactions')}</span>}
      className="col-span-full"
      headerClassName="pb-3 sm:pb-4"
      headerRight={
        <Link href={`/transactions?${new URLSearchParams({
          ...(walletId ? { wallets: walletId } : {}),
          ...(categoryId ? { categories: categoryId } : {}),
          ...(recurringId ? { recurringId: recurringId } : {})
        }).toString()}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <span className="text-xs sm:text-sm">View All</span> <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
           <Receipt className="mx-auto h-8 w-8 mb-2 opacity-20" />
           <p className="text-xs sm:text-sm">{t('dashboard.widgets.no_transactions')}</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {transactions.map((tx: any) => (
            <TransactionListItem 
              key={tx.transaction_id} 
              transaction={tx} 
              dateFormatPreference={dateFormatPreference} 
              locale={locale} 
            />
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
