'use client';

import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/i18n/dictionary-provider';
import { CategoryWithChildren } from '@/types/models';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateCategoryForm } from './create-category-form';

interface CreateCategoryTriggerProps {
  parentCategories: CategoryWithChildren[];
}

export function CreateCategoryTrigger({ parentCategories }: CreateCategoryTriggerProps) {
  const [open, setOpen] = useState(false);
  const dictionary = useDictionary();

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Trigger */}
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" /> {dictionary.categories.newCategory}
      </Button>

      {/* Mobile FAB Trigger */}
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <PlusIcon className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title={dictionary.categories.createCategory}
        description="Create a new parent or subcategory to organize your transactions."
      >
        <CreateCategoryForm parentCategories={parentCategories} onSuccess={handleSuccess} />
      </ResponsiveDrawer>
    </>
  );
}
