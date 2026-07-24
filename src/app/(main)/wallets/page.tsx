import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getUserPreferences } from '@/features/preferences/queries';
import { CreateWalletTrigger } from '@/features/wallets/components/create-wallet-trigger';
import { WalletsClientView } from '@/features/wallets/components/wallet-client-view';
import { getWallets, getArchivedWallets } from '@/features/wallets/queries';
import { getTranslator } from '@/i18n/server';
import { getUser } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: `${t('wallets.title')} - Ledgr`,
    description: t('wallets.description'),
  };
}

export default async function WalletsPage() {
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

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
          <h1 className="text-2xl font-semibold tracking-tight">{t('wallets.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('wallets.description')}
          </p>
        </div>
        <div className="hidden md:block">
          <CreateWalletTrigger currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
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
        <CreateWalletTrigger currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} />
      </div>
    </div>
  );
}
