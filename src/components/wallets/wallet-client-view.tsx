'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Wallet, Currency } from '@/types/models';
import { WalletCard } from './wallet-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WalletsClientViewProps {
  regularWallets: Wallet[];
  savingsWallets: Wallet[];
  investmentWallets: Wallet[];
  archivedWallets: Wallet[];
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

  const view = searchParams.get('view') === 'archived' ? 'archived' : 'active';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'archived') {
      params.set('view', 'archived');
    } else {
      params.delete('view');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Tabs value={view} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-2">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="space-y-8 mt-0">
        {regularWallets.length === 0 && savingsWallets.length === 0 && investmentWallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-card text-card-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl">🏦</span>
            </div>
            <h3 className="text-xl font-medium">No active wallets</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              You don't have any active wallets yet. Add a new account, savings, or investment to get started.
            </p>
          </div>
        ) : (
          <>
            {regularWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">Accounts & Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
                  ))}
                </div>
              </section>
            )}

            {savingsWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">Savings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savingsWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
                  ))}
                </div>
              </section>
            )}

            {investmentWallets.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">Investments</h2>
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
            <h3 className="text-xl font-medium">No archived wallets</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Wallets you archive will appear here.
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
