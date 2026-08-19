import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { TaxonomyNavTabs } from '@/components/shared/taxonomy-nav-tabs';
import { CategoryGrid, CreateCategoryTrigger, CategoryDetailDashboard } from '@/features/categories/components';
import { getCategories } from '@/features/categories/queries';
import { parsePeriod } from '@/features/dashboard/utils';
import { getTranslator } from '@/i18n/server';
import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: `${t('categories.title')} | Ledgr`,
    description: t('categories.description'),
  };
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; period?: string; from?: string; to?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const categories = await getCategories(user.id);
  
  const { from, to, resolvedPeriod } = await parsePeriod(resolvedParams?.period, resolvedParams?.from, resolvedParams?.to);

  // For the dropdown, we only want top-level categories that can be parents
  const parentCategories = categories.filter((c) => c.parent_id === null && c.is_active);

  const trigger = <CreateCategoryTrigger parentCategories={parentCategories} />;

  return (
    <PageContainer>
      <PageHeader 
        title={t('categories.title')}
        description={t('categories.description')}
        action={trigger}
      />

      <TaxonomyNavTabs />

      <CategoryGrid 
        categories={categories} 
        activeCategoryId={resolvedParams?.categoryId}
      >
        {resolvedParams?.categoryId ? (
          <CategoryDetailDashboard 
            categoryId={resolvedParams.categoryId} 
            period={resolvedPeriod}
            fromParam={from}
            toParam={to}
          />
        ) : null}
      </CategoryGrid>

      {/* Mobile trigger */}
      <div className="md:hidden">
        {trigger}
      </div>
    </PageContainer>
  );
}
