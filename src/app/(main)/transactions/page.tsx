import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { getUser, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWallets } from '@/features/wallets/queries';
import { getCategories } from '@/features/categories/queries';
import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getPrimaryCurrencyCode, getTransactions } from '@/features/transactions/queries';
import { getTags } from '@/features/tags/queries';
import { getUserPreferences } from '@/features/preferences/queries';
import { CreateTransactionTrigger } from '@/features/transactions/components/create-transaction-trigger';
import { TransactionsClientView } from '@/features/transactions/components/transactions-client-view';
import { flattenCategoriesForSelect } from '@/features/categories/utils';
import { Metadata } from 'next';

import { getTranslator } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return {
    title: `${t('transactions.title')} - Ledgr`,
    description: t('transactions.description') as string,
  };
}

export default async function TransactionsPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1;
  const search = (searchParams?.search as string) || "";
  const walletIds = searchParams?.wallets ? (searchParams.wallets as string).split(",") : [];
  const categoryIds = searchParams?.categories ? (searchParams.categories as string).split(",") : [];
  const tagIds = searchParams?.tags ? (searchParams.tags as string).split(",") : [];
  const currencyCodes = searchParams?.currencies ? (searchParams.currencies as string).split(",") : [];
  const startDate = searchParams?.startDate as string | undefined;
  const endDate = searchParams?.endDate as string | undefined;
  const minAmount = searchParams?.minAmount ? parseFloat(searchParams.minAmount as string) : undefined;
  const maxAmount = searchParams?.maxAmount ? parseFloat(searchParams.maxAmount as string) : undefined;
  const type = (searchParams?.type as 'income' | 'expense' | 'all') || 'all';
  const recurringId = searchParams?.recurringId as string | undefined;
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch all necessary context data in parallel
  const [
    transactionsResponse,
    wallets,
    nestedCategories,
    currencies,
    primaryCurrencyCode,
    tags,
    preferences,
    { t }
  ] = await Promise.all([
    getTransactions(user.id, { 
      page, pageSize: 20, search, walletIds, categoryIds, tagIds, currencyCodes,
      startDate, endDate, minAmount, maxAmount, type, recurringId 
    }),
    getWallets(user.id),
    getCategories(user.id),
    getActiveCurrencies(),
    getPrimaryCurrencyCode(supabase, user.id),
    getTags(user.id, { pageSize: 1000 }),
    getUserPreferences(user.id),
    getTranslator()
  ]);

  if (!primaryCurrencyCode) {
    redirect('/onboarding');
  }

  const categories = flattenCategoriesForSelect(nestedCategories);

  const trigger = (
    <CreateTransactionTrigger 
      wallets={wallets as any} 
      categories={categories}
      currencies={currencies as any}
      tags={tags.data as any}
      defaultCurrency={primaryCurrencyCode}
    />
  );

  return (
    <PageContainer>
      <PageHeader 
        title={t('transactions.title')}
        description={t('transactions.description')}
        action={trigger}
      />

      <TransactionsClientView 
        transactions={transactionsResponse.data as any} 
        totalCount={transactionsResponse.count}
        currentPage={page}
        wallets={wallets as any}
        categories={categories}
        tags={tags.data as any}
        currencies={currencies as any}
        primaryCurrencyCode={primaryCurrencyCode}
        dateFormatPreference={preferences?.date_format || 'DD/MM/YYYY'}
        locale={preferences?.language_locale || 'en-US'}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        {trigger}
      </div>
    </PageContainer>
  );
}
