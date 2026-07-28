'use client';

import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { CategoryWithChildren, Currency } from '@/types/models';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CreateBudgetWizard } from '@/features/budgets/components/create-budget-wizard';

interface CreateBudgetTriggerProps {
  categories: CategoryWithChildren[];
  currencyCode: string;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
}

export function CreateBudgetTrigger({ categories, currencyCode, currencies }: CreateBudgetTriggerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Trigger */}
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" /> {t('budgets.newBudget')}
      </Button>

      {/* Mobile FAB Trigger */}
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <PlusIcon className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title={t('budgets.createBudget')}
        description={t('budgets.description')}
      >
        <div className="p-4 md:p-0">
          <CreateBudgetWizard
            categories={categories}
            onSuccess={handleSuccess}
            currencyCode={currencyCode}
            currencies={currencies}
          />
        </div>
      </ResponsiveDrawer>
    </>
  );
}
