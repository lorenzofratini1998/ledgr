'use client';

import { ActionDialog } from '@/components/shared/action-dialog';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { archiveCategoryAction, deleteCategoryAction, unarchiveCategoryAction } from '@/features/categories/actions';
import { CategoryDetailView } from '@/features/categories/components/category-detail-view';
import { CategoryMasterView } from '@/features/categories/components/category-master-view';
import { CreateCategoryForm } from '@/features/categories/components/create-category-form';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { CategoryWithChildren } from '@/types/models';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface CategoryGridProps {
  categories: CategoryWithChildren[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('active');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [selectedCategoryForAction, setSelectedCategoryForAction] = useState<CategoryWithChildren | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteAllPromptOpen, setIsDeleteAllPromptOpen] = useState(false);
  
  const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
  const [parentForNewSubcategory, setParentForNewSubcategory] = useState<CategoryWithChildren | null>(null);

  // Active view: only active parents, containing only active children
  const activeCategoriesWithFilteredChildren = categories
    .filter(c => c.is_active)
    .map(c => ({
      ...c,
      children: (c.children || []).filter(child => child.is_active)
    }));

  // Archived view: archived parents OR active parents that have at least one archived child
  const archivedCategoriesWithFilteredChildren = categories
    .filter(c => !c.is_active || (c.children || []).some(child => !child.is_active))
    .map(c => ({
      ...c,
      children: (c.children || []).filter(child => !child.is_active)
    }));

  let selectedParentCategoryFiltered: CategoryWithChildren | null = null;
  if (selectedCategoryId) {
    if (activeTab === 'active') {
       selectedParentCategoryFiltered = activeCategoriesWithFilteredChildren.find(c => c.category_id === selectedCategoryId) || null;
    } else {
       selectedParentCategoryFiltered = archivedCategoriesWithFilteredChildren.find(c => c.category_id === selectedCategoryId) || null;
    }
  }

  // Clear selection if the item disappears from the current tab
  useEffect(() => {
    if (selectedCategoryId && !selectedParentCategoryFiltered) {
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryId, selectedParentCategoryFiltered]);

  const handleSelectCategory = (category: CategoryWithChildren) => {
    setSelectedCategoryId(category.category_id);
  };

  const handleBack = () => {
    setSelectedCategoryId(null);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedCategoryId(null);
  };

  const openEdit = (category: CategoryWithChildren) => {
    setSelectedCategoryForAction(category);
    setIsEditOpen(true);
  };

  const openArchive = (category: CategoryWithChildren) => {
    setSelectedCategoryForAction(category);
    setIsArchiveOpen(true);
  };

  const openDelete = (category: CategoryWithChildren) => {
    setSelectedCategoryForAction(category);
    setIsDeleteOpen(true);
  };
  
  const openAddSubcategory = (parentCategory: CategoryWithChildren) => {
    setParentForNewSubcategory(parentCategory);
    setIsAddSubcategoryOpen(true);
  };

  const handleArchive = () => {
    if (!selectedCategoryForAction) return;
    startTransition(async () => {
      const res = await archiveCategoryAction(selectedCategoryForAction.category_id);
      if (res.success) {
        toast.success(t('categories.archivedSuccess'));
        setIsArchiveOpen(false);
      } else {
        toast.error(res.message || t('categories.failedArchive'));
      }
    });
  };

  const handleDelete = (forceCascade: boolean = false) => {
    if (!selectedCategoryForAction) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(selectedCategoryForAction.category_id, forceCascade);
      if (res.success) {
        toast.success(t('categories.deletedSuccess'));
        setIsDeleteOpen(false);
        setIsDeleteAllPromptOpen(false);
        if (selectedCategoryId === selectedCategoryForAction.category_id) {
          setSelectedCategoryId(null);
        }
      } else {
        if (res.message === 'HAS_CHILDREN') {
          setIsDeleteOpen(false);
          setIsDeleteAllPromptOpen(true);
        } else {
          toast.error(res.message || t('categories.failedDelete'));
        }
      }
    });
  };

  const handleUnarchive = (id: string) => {
    startTransition(async () => {
      const res = await unarchiveCategoryAction(id);
      if (res.success) {
        toast.success(t('categories.reactivatedSuccess'));
      } else {
        toast.error(res.message || t('categories.failedReactivate'));
      }
    });
  };

  return (
    <div className="flex flex-col h-full mt-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active">
            {t('wallets.active')}
          </TabsTrigger>
          <TabsTrigger value="archived">
            {t('wallets.archived')}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 flex flex-col md:flex-row rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden min-h-[600px]">
          {/* Master Pane */}
          <div className={`w-full md:w-2/5 md:block shrink-0 md:border-r border-border bg-card overflow-y-auto ${selectedCategoryId ? 'hidden' : 'block'}`}>
            <TabsContent value="active" className="m-0 border-0 p-0 h-full data-[state=inactive]:hidden">
              <CategoryMasterView
                categories={activeCategoriesWithFilteredChildren}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                isArchivedView={false}
              />
            </TabsContent>
            <TabsContent value="archived" className="m-0 border-0 p-0 h-full data-[state=inactive]:hidden">
              <CategoryMasterView
                categories={archivedCategoriesWithFilteredChildren}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                isArchivedView={true}
              />
            </TabsContent>
          </div>

          {/* Detail Pane */}
          <div className={`w-full md:w-3/5 md:block flex-1 bg-muted/10 overflow-y-auto p-4 md:p-6 ${selectedCategoryId ? 'block' : 'hidden'}`}>
            <CategoryDetailView
              category={selectedParentCategoryFiltered}
              onBack={handleBack}
              onEdit={openEdit}
              onArchive={openArchive}
              onDelete={openDelete}
              onUnarchive={handleUnarchive}
              onAddSubcategory={openAddSubcategory}
            />
          </div>
        </div>
      </Tabs>

      {/* Edit Sheet/Drawer */}
      <ResponsiveDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={t('categories.editCategory')}
        description={t('categories.editDescription')}
      >
        {selectedCategoryForAction && (
          <CreateCategoryForm
            parentCategories={categories.filter(c => c.is_active)}
            initialData={selectedCategoryForAction}
            onSuccess={() => setIsEditOpen(false)}
          />
        )}
      </ResponsiveDrawer>
      
      {/* Add Subcategory Sheet/Drawer */}
      <ResponsiveDrawer
        open={isAddSubcategoryOpen}
        onOpenChange={setIsAddSubcategoryOpen}
        title={t('categories.newCategory')}
        description={t('categories.descriptionPlaceholder')}
      >
        {parentForNewSubcategory && (
          <CreateCategoryForm
            parentCategories={categories.filter(c => c.is_active)}
            initialParentId={parentForNewSubcategory.category_id}
            onSuccess={() => setIsAddSubcategoryOpen(false)}
          />
        )}
      </ResponsiveDrawer>

      {/* Archive Dialog */}
      <ActionDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        title={t('categories.archiveCategory')}
        description={
          <>
            {t('categories.archivePrompt1')} <strong>{selectedCategoryForAction?.category_name}</strong>{t('categories.archivePrompt2')}
          </>
        }
        actionText={t('categories.archiveAction')}
        cancelText={t('common.cancel')}
        onAction={handleArchive}
        isPending={isPending}
      />

      {/* Delete Dialog */}
      <ActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t('categories.deletePermanently')}
        description={
          <>
            {t('categories.deletePrompt1')}
            <strong> {selectedCategoryForAction?.category_name}</strong>{t('categories.deletePrompt2')}
          </>
        }
        actionText={t('common.delete')}
        cancelText={t('common.cancel')}
        onAction={() => handleDelete(false)}
        isPending={isPending}
        destructive={true}
      />

      {/* Delete All Prompt Dialog */}
      <ActionDialog
        open={isDeleteAllPromptOpen}
        onOpenChange={setIsDeleteAllPromptOpen}
        title={t('categories.deleteAllTitle')}
        description={t('categories.deleteAllPrompt')}
        actionText={t('categories.deleteAllAction')}
        cancelText={t('common.cancel')}
        onAction={() => handleDelete(true)}
        isPending={isPending}
        destructive={true}
      />
    </div>
  );
}
