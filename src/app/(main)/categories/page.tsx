import { CategoryGrid } from '@/features/categories/components/category-grid';
import { CreateCategoryTrigger } from '@/features/categories/components/create-category-trigger';
import { getCategories } from '@/features/categories/queries';
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

export default async function CategoriesPage() {
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const categories = await getCategories(user.id);

  // For the dropdown, we only want top-level categories that can be parents
  const parentCategories = categories.filter((c) => c.parent_id === null && c.is_active);

  return (
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('categories.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('categories.description')}
          </p>
        </div>
        <div className="hidden md:block">
          <CreateCategoryTrigger parentCategories={parentCategories} />
        </div>
      </div>

      <CategoryGrid categories={categories} />

      {/* Mobile trigger */}
      <div className="md:hidden">
        <CreateCategoryTrigger parentCategories={parentCategories} />
      </div>
    </div>
  );
}
