import { Suspense } from 'react';
import { getRecurringPaymentById } from '@/features/recurring/queries';
import { getUser } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getTranslator } from '@/i18n/server';
import { Metadata } from 'next';
import { Clock, CalendarDays, Coins, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { RecentTransactionsWidget, RecentTransactionsWidgetSkeleton } from '@/features/dashboard/components/widgets/recent-transactions-widget';
import { RecurringHistoryWidget, RecurringHistoryWidgetSkeleton } from '@/features/recurring/components/recurring-history-widget';
import { TotalSpentKPI } from '@/features/recurring/components/total-spent-kpi';
import { getUserPreferences } from '@/features/preferences/queries';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout/page-container';
import { DetailHeader } from '@/components/shared/detail-header';
import { KpiCard } from '@/components/shared/kpi-card';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: { user } } = await getUser();
  if (!user) return { title: 'Recurring Payment Not Found' };
  
  try {
    const payment = await getRecurringPaymentById(id, user.id);
    if (!payment) return { title: 'Recurring Payment Not Found' };

    return {
      title: `${payment.description} - Ledgr`,
    };
  } catch (e) {
    return { title: 'Recurring Payment Not Found' };
  }
}

export default async function ScheduledPaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paymentId } = await params;
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/login');
  }

  let payment;
  try {
    payment = await getRecurringPaymentById(paymentId, user.id);
  } catch (e) {
    notFound();
  }

  if (!payment) {
    notFound();
  }

  const prefs = await getUserPreferences(user.id);
  const dateFormat = prefs?.date_format || 'DD/MM/YYYY';
  const locale = prefs?.language_locale || 'en-US';

  const colorStyle = payment.categories?.color 
    ? { backgroundColor: `${payment.categories.color}20`, color: payment.categories.color } 
    : {};

  // Annual projection based on frequency
  const amount = Number(payment.amount);
  let multiplier = 12;
  switch (payment.frequency) {
    case 'weekly': multiplier = 52; break;
    case 'monthly': multiplier = 12; break;
    case 'yearly': multiplier = 1; break;
  }
  const projectedAnnual = Math.abs(amount) * multiplier;

  return (
    <PageContainer>
      {/* Back Button & Header */}
      <DetailHeader 
        backHref="/scheduled"
        title={payment.description}
        icon={RefreshCw}
        iconStyle={colorStyle}
        badge={payment.status === 'paused' && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground ml-2">Paused</Badge>
        )}
        subtitle={
          <>
            <span>{payment.frequency}</span>
            <span>•</span>
            <span className="truncate">{payment.categories?.category_name || t('transactions.uncategorized')}</span>
          </>
        }
      />

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
         <KpiCard 
           label="Next Execution"
           icon={Clock}
           value={formatDate(payment.next_execution_date, dateFormat)}
         />
         <KpiCard 
           label="Projected Annual Cost"
           icon={CalendarDays}
           value={formatCurrency(projectedAnnual, payment.currency_code, locale)}
         />
         <KpiCard 
           label="Total Spent"
           icon={Coins}
           value={
             <Suspense fallback={<span>...</span>}>
               <TotalSpentKPI recurringId={paymentId} currencyCode={payment.currency_code} locale={locale} />
             </Suspense>
           }
           valueClassName="text-emerald-600"
         />
      </div>

      {/* Widgets Grid */}
      <div className="space-y-4 md:space-y-6">
        <div className="grid gap-4 md:gap-6 grid-cols-1">
          <Suspense fallback={<RecurringHistoryWidgetSkeleton />}>
             <RecurringHistoryWidget recurringId={paymentId} currencyCode={payment.currency_code} locale={locale} dateFormatPreference={dateFormat} />
          </Suspense>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1">
          <Suspense fallback={<RecentTransactionsWidgetSkeleton />}>
             <RecentTransactionsWidget recurringId={paymentId} locale={locale} dateFormatPreference={dateFormat} />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}
