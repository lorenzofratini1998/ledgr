import { Metadata } from 'next';
import { getWallets, getArchivedWallets } from '@/data/wallets';
import { getActiveCurrencies } from '@/data/currencies';
import { WalletsClientView } from '@/components/wallets/wallet-client-view';
import { CreateWalletDrawer } from '@/components/wallets/create-wallet-drawer';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getUserPreferences } from '@/data/user-preferences';

export const metadata: Metadata = {
  title: 'Wallets - Ledgr',
  description: 'Manage your accounts, cards, and investments.',
};

export default async function WalletsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const userId = user.id;

  const [wallets, archivedWallets, currencies, userPrefs] = await Promise.all([
    getWallets(userId),
    getArchivedWallets(userId),
    getActiveCurrencies(),
    getUserPreferences(userId),
  ]);

  const defaultCurrencyCode = userPrefs?.primary_currency_code
    || currencies.find(c => (c as any).is_default)?.iso_code
    || 'USD';

  const regularWallets = wallets.filter((w) => w.type === 'regular');
  const savingsWallets = wallets.filter((w) => w.type === 'savings');
  const investmentWallets = wallets.filter((w) => w.type === 'investment');

  return (
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wallets</h1>
          <p className="text-sm text-muted-foreground">
            Manage your accounts and investments.
          </p>
        </div>
        <div className="hidden md:block">
          <CreateWalletDrawer currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
        </div>
      </div>

      <WalletsClientView
        regularWallets={regularWallets}
        savingsWallets={savingsWallets}
        investmentWallets={investmentWallets}
        archivedWallets={archivedWallets}
        currencies={currencies}
        defaultCurrencyCode={defaultCurrencyCode}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        <CreateWalletDrawer currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
      </div>
    </div>
  );
}
