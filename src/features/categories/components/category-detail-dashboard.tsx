import { Suspense } from 'react';
import { getCategories } from '@/features/categories/queries';
import { getUser } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PeriodSelector } from '@/features/dashboard/components/period-selector';
import { IncomeVsExpensesWidget, IncomeVsExpensesWidgetSkeleton } from '@/features/dashboard/components/widgets/income-vs-expenses-widget';
import { CategoryBreakdownWidget, CategoryBreakdownWidgetSkeleton } from '@/features/dashboard/components/widgets/category-breakdown-widget';
import { RecentTransactionsWidget, RecentTransactionsWidgetSkeleton } from '@/features/dashboard/components/widgets/recent-transactions-widget';

interface CategoryDetailDashboardProps {
  categoryId: string;
  period?: string;
  fromParam?: string;
  toParam?: string;
}

export async function CategoryDetailDashboard({
  categoryId,
  period,
  fromParam,
  toParam
}: CategoryDetailDashboardProps) {
  const { data: { user } } = await getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const categories = await getCategories(user.id);
  const category = categories.find(c => c.category_id === categoryId);

  if (!category) {
    return notFound();
  }

  // The from/to logic has already been calculated by parsePeriod in the parent 
  // but we can just pass them down directly to the widgets
  const from = fromParam || '';
  const to = toParam || '';

  const hasSubcategories = category.children && category.children.length > 0;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight">Analytics</h3>
        <PeriodSelector defaultPeriod={period} defaultFrom={from} defaultTo={to} />
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Suspense fallback={<IncomeVsExpensesWidgetSkeleton className="col-span-full" />} key={`trend-cat-${categoryId}-${from}-${to}`}>
           <IncomeVsExpensesWidget from={from} to={to} categoryId={categoryId} className="col-span-full" />
        </Suspense>

        {hasSubcategories ? (
          <Suspense fallback={<CategoryBreakdownWidgetSkeleton className="col-span-full" />} key={`breakdown-cat-${categoryId}-${from}-${to}`}>
             <CategoryBreakdownWidget from={from} to={to} categoryId={categoryId} className="col-span-full" />
          </Suspense>
        ) : (
          <div className="col-span-full border border-dashed rounded-xl flex items-center justify-center text-muted-foreground p-6 text-center text-sm">
            No subcategories to breakdown. Add subcategories to see detailed spending.
          </div>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Suspense fallback={<RecentTransactionsWidgetSkeleton />}>
           <RecentTransactionsWidget categoryId={categoryId} />
        </Suspense>
      </div>
    </div>
  );
}
