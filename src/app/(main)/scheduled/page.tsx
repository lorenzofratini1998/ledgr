import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { getUser, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWallets } from '@/features/wallets/queries';
import { getCategories } from '@/features/categories/queries';
import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getPrimaryCurrencyCode } from '@/features/transactions/queries';
import { getRecurringPayments } from '@/features/recurring/queries';
import { getUserPreferences } from '@/features/preferences/queries';
import { Metadata } from 'next';
import { RecurringList, CreateRecurringTrigger } from '@/features/recurring/components';
import { getTranslator } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Scheduled Payments - Ledgr',
    description: 'Manage your recurring and scheduled payments',
  };
}

export default async function ScheduledPage(
  props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page as string, 10) : 1;
  const status = (searchParams?.status as "active" | "paused" | "completed") || undefined;
  
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  const [
    recurringResponse,
    wallets,
    nestedCategories,
    currencies,
    primaryCurrencyCode,
    preferences,
    { t }
  ] = await Promise.all([
    getRecurringPayments(user.id, { page, pageSize: 20, status }),
    getWallets(user.id),
    getCategories(user.id),
    getActiveCurrencies(),
    getPrimaryCurrencyCode(supabase, user.id),
    getUserPreferences(user.id),
    getTranslator()
  ]);

  if (!primaryCurrencyCode) {
    redirect('/onboarding');
  }

  const categories = nestedCategories.reduce((acc, cat) => {
    acc.push({ category_id: cat.category_id, category_name: cat.category_name });
    if (cat.children) {
      cat.children.forEach(child => {
        acc.push({ category_id: child.category_id, category_name: `-- ${child.category_name}` });
      });
    }
    return acc;
  }, [] as { category_id: string; category_name: string }[]);

  const trigger = (
    <CreateRecurringTrigger 
      wallets={wallets as any} 
      categories={categories}
      currencies={currencies as any}
      defaultCurrency={primaryCurrencyCode}
    />
  );

  return (
    <PageContainer>
      <PageHeader
        title="Scheduled Payments"
        description="Manage your subscriptions and future bills"
        action={trigger}
      />

      <RecurringList 
        data={recurringResponse.data as any} 
        totalCount={recurringResponse.count}
        currentPage={page}
        primaryCurrencyCode={primaryCurrencyCode}
        dateFormatPreference={preferences?.date_format || 'DD/MM/YYYY'}
        locale={preferences?.language_locale || 'en-US'}
        wallets={wallets as any}
        categories={categories}
        currencies={currencies as any}
      />

      <div className="md:hidden">
        {trigger}
      </div>
    </PageContainer>
  );
}
