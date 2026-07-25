'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Currency, WalletWithBalance } from '@/types/models';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { WalletCard } from './wallet-card';

interface WalletsClientViewProps {
  regularWallets: WalletWithBalance[];
  savingsWallets: WalletWithBalance[];
  investmentWallets: WalletWithBalance[];
  archivedWallets: WalletWithBalance[];
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function WalletsClientView({
  regularWallets,
  savingsWallets,
  investmentWallets,
  archivedWallets,
  currencies,
  defaultCurrencyCode,
}: WalletsClientViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const initialView = searchParams.get('view') === 'archived' ? 'archived' : 'active';
  const [view, setView] = useState(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleTabChange = (newValue: string) => {
    setView(newValue);
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === 'archived') {
      params.set('view', 'archived');
    } else {
      params.delete('view');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={view} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger value="active">{t('wallets.active')}</TabsTrigger>
        <TabsTrigger value="archived">{t('wallets.archived')}</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-8 mt-0">
        {regularWallets.length === 0 && savingsWallets.length === 0 && investmentWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card text-card-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🏦</span>
            </div>
            <h3 className="text-xl font-medium">{t('wallets.noActiveWallets')}</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {t('wallets.noActiveDescription')}
            </p>
          </div>
        ) : (
          <>
            {regularWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">{t('wallets.types.regular')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
                  ))}
                </div>
              </section>
            )}

            {savingsWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">{t('wallets.types.savings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savingsWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
                  ))}
                </div>
              </section>
            )}

            {investmentWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">{t('wallets.types.investment')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investmentWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </TabsContent>

      <TabsContent value="archived" className="mt-0">
        {archivedWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card text-card-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl opacity-50">📦</span>
            </div>
            <h3 className="text-xl font-medium">{t('wallets.noArchivedWallets')}</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {t('wallets.noArchivedDescription')}
            </p>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80 grayscale-[0.3] transition-all hover:grayscale-0 hover:opacity-100">
              {archivedWallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
              ))}
            </div>
          </section>
        )}
      </TabsContent>
    </Tabs>
  );
}
