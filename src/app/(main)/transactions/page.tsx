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
      startDate, endDate, minAmount, maxAmount, type 
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

  // Flatten categories for the select dropdown
  const categories = nestedCategories.reduce((acc, cat) => {
    acc.push({ category_id: cat.category_id, category_name: cat.category_name });
    if (cat.children) {
      cat.children.forEach(child => {
        acc.push({ category_id: child.category_id, category_name: `-- ${child.category_name}` });
      });
    }
    return acc;
  }, [] as { category_id: string; category_name: string }[]);

  return (
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('transactions.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('transactions.description')}
          </p>
        </div>
        <div className="hidden md:block">
          <CreateTransactionTrigger 
            wallets={wallets as any} 
            categories={categories}
            currencies={currencies as any}
            tags={tags.data as any}
            defaultCurrency={primaryCurrencyCode}
          />
        </div>
      </div>

      <TransactionsClientView 
        transactions={transactionsResponse.data as any} 
        totalCount={transactionsResponse.count}
        currentPage={page}
        wallets={wallets as any}
        categories={nestedCategories as any}
        tags={tags.data as any}
        currencies={currencies as any}
        primaryCurrencyCode={primaryCurrencyCode}
        dateFormatPreference={preferences?.date_format || 'DD/MM/YYYY'}
        locale={preferences?.language_locale || 'en-US'}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        <CreateTransactionTrigger 
          wallets={wallets as any} 
          categories={categories}
          currencies={currencies as any}
          tags={tags.data as any}
          defaultCurrency={primaryCurrencyCode}
        />
      </div>
    </div>
  );
}
