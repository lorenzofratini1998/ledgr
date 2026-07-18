'use client';

import { ActionDialog } from '@/components/shared/action-dialog';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { archiveCategoryAction, deleteCategoryAction, unarchiveCategoryAction } from '@/features/categories/actions';
import { CreateCategoryForm } from '@/features/categories/components/create-category-form';
import { useDictionary } from '@/i18n/dictionary-provider';
import { CategoryWithChildren } from '@/types/models';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CategoryList } from './category-list';

interface CategoryGridProps {
  categories: CategoryWithChildren[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [isPending, startTransition] = useTransition();
  const dictionary = useDictionary();
  
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithChildren | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const activeCategories = categories.filter(c => c.is_active);
  const archivedCategories = categories.filter(c => !c.is_active);
  
  const activeCategoriesWithFilteredChildren = activeCategories.map(c => ({
    ...c,
    children: (c.children || []).filter(child => child.is_active)
  }));
  const archivedCategoriesWithFilteredChildren = archivedCategories.map(c => ({
    ...c,
    children: (c.children || []).filter(child => !child.is_active)
  }));

  const openEdit = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const openArchive = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setIsArchiveOpen(true);
  };

  const openDelete = (category: CategoryWithChildren) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleArchive = () => {
    if (!selectedCategory) return;
    startTransition(async () => {
      const res = await archiveCategoryAction(selectedCategory.category_id);
      if (res.success) {
        toast.success(dictionary.categories.archivedSuccess);
        setIsArchiveOpen(false);
      } else {
        toast.error(res.message || dictionary.categories.failedArchive);
      }
    });
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(selectedCategory.category_id);
      if (res.success) {
        toast.success(dictionary.categories.deletedSuccess);
        setIsDeleteOpen(false);
      } else {
        toast.error(res.message || dictionary.categories.failedDelete);
      }
    });
  };

  const handleUnarchive = (id: string) => {
    startTransition(async () => {
      const res = await unarchiveCategoryAction(id);
      if (res.success) {
        toast.success(dictionary.categories.reactivatedSuccess);
      } else {
        toast.error(res.message || dictionary.categories.failedReactivate);
      }
    });
  };

  return (
    <>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">{dictionary.wallets.active}</TabsTrigger>
          <TabsTrigger value="archived">{dictionary.wallets.archived}</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <CategoryList
            categories={activeCategoriesWithFilteredChildren}
            isArchivedView={false}
            onEdit={openEdit}
            onArchive={openArchive}
            onDelete={openDelete}
            onUnarchive={handleUnarchive}
          />
        </TabsContent>
        <TabsContent value="archived">
          <CategoryList
            categories={archivedCategoriesWithFilteredChildren}
            isArchivedView={true}
            onEdit={openEdit}
            onArchive={openArchive}
            onDelete={openDelete}
            onUnarchive={handleUnarchive}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Sheet/Drawer */}
      <ResponsiveDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={dictionary.categories.editCategory}
        description={dictionary.categories.editDescription}
      >
        {selectedCategory && (
          <CreateCategoryForm
            parentCategories={activeCategories}
            initialData={selectedCategory}
            onSuccess={() => setIsEditOpen(false)}
          />
        )}
      </ResponsiveDrawer>

      {/* Archive Dialog */}
      <ActionDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        title={dictionary.categories.archiveCategory}
        description={
          <>
            {dictionary.categories.archivePrompt1} <strong>{selectedCategory?.category_name}</strong>{dictionary.categories.archivePrompt2}
          </>
        }
        actionText={dictionary.categories.archiveAction}
        cancelText={dictionary.common.cancel}
        onAction={handleArchive}
        isPending={isPending}
      />

      {/* Delete Dialog */}
      <ActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={dictionary.categories.deletePermanently}
        description={
          <>
            {dictionary.categories.deletePrompt1}
            <strong> {selectedCategory?.category_name}</strong>{dictionary.categories.deletePrompt2}
          </>
        }
        actionText={dictionary.common.delete}
        cancelText={dictionary.common.cancel}
        onAction={handleDelete}
        isPending={isPending}
        destructive={true}
      />
    </>
  );
}
