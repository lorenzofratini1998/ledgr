import { fetchWalletBalancesAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { Wallet } from 'lucide-react';
import { getTranslator } from '@/i18n/server';

export async function WalletBalancesWidget() {
  const res = await fetchWalletBalancesAction();
  const balances = res.success && res.data ? res.data : [];
  const { t } = await getTranslator();

  return (
    <WidgetCard title={t('dashboard.widgets.wallet_balances')} className="col-span-full md:col-span-1 xl:col-span-1" contentClassName="space-y-4">
      {balances.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('dashboard.widgets.no_active_wallets')}</p>
      ) : (
        balances.map((wallet: any) => (
          <div key={wallet.wallet_id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white" 
                style={{ backgroundColor: wallet.color || '#94a3b8' }}
              >
                <Wallet size={16} />
              </div>
              <div>
                <p className="font-medium text-sm leading-none">{wallet.name}</p>
                {wallet.type && <p className="text-xs text-muted-foreground mt-1 capitalize">{wallet.type}</p>}
              </div>
            </div>
            <div className="font-semibold text-sm">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(wallet.balance)}
            </div>
          </div>
        ))
      )}
    </WidgetCard>
  );
}

export function WalletBalancesWidgetSkeleton() {
  return (
    <WidgetCardSkeleton className="col-span-full md:col-span-1 xl:col-span-1" contentClassName="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between items-center">
           <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-muted"></div>
              <div className="space-y-2">
                 <div className="h-3 w-20 bg-muted rounded"></div>
                 <div className="h-2 w-16 bg-muted rounded"></div>
              </div>
           </div>
           <div className="h-4 w-16 bg-muted rounded"></div>
        </div>
      ))}
    </WidgetCardSkeleton>
  );
}
