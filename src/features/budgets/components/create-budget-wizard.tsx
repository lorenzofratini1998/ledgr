'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createBudgetAction, updateBudgetAction } from '@/features/budgets/actions';
import { createBudgetSchema, CreateBudgetInput, updateBudgetSchema, UpdateBudgetInput } from '@/features/budgets/schemas';
import { useActionMutation } from '@/hooks/use-action-mutation';
import { CategoryWithChildren } from '@/types/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { useState } from 'react';

import { Currency } from '@/types/models';
import { BudgetData } from './budget-card';
import { WizardBasicStep } from './wizard-steps/wizard-basic-step';
import { WizardCategoryStep } from './wizard-steps/wizard-category-step';

interface CreateBudgetWizardProps {
  categories: CategoryWithChildren[];
  onSuccess?: () => void;
  currencyCode: string;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  initialData?: BudgetData;
}

export function CreateBudgetWizard({ categories, onSuccess, currencyCode, currencies, initialData }: CreateBudgetWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<any>({
    resolver: zodResolver(initialData ? updateBudgetSchema : createBudgetSchema),
    defaultValues: {
      budget_id: initialData?.budget_id,
      name: initialData?.name || '',
      amount: initialData?.amount?.toString() || '',
      start_date: initialData ? new Date(initialData.start_date) : new Date(),
      end_date: initialData ? new Date(initialData.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      is_global: initialData?.is_global ?? false,
      type: initialData?.type || 'expense',
      recurrence: initialData?.recurrence || 'none',
      categories: initialData?.budget_categories?.map(bc => ({
        category_id: bc.category_id,
        allocation_amount: bc.allocation_amount?.toString() || ''
      })) || [],
    },
  });

  const { mutate, isPending: isSubmitting } = useActionMutation(form, {
    action: async (data) => initialData 
      ? updateBudgetAction(data as UpdateBudgetInput)
      : createBudgetAction(data as CreateBudgetInput),
    successMessage: () => t(initialData ? 'budgets.updatedSuccess' as any : 'budgets.createdSuccess' as any),
    errorMessage: () => t(initialData ? 'budgets.failedUpdate' as any : 'budgets.failedCreate' as any),
    resetOnSuccess: true,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const isGlobal = form.watch('is_global');
  const budgetAmount = form.watch('amount') || 0;
  
  const selectedCurrency = currencies.find((c: any) => c.iso_code === currencyCode);

  const onSubmit = (data: any) => {
    if (step === 1 && !isGlobal) {
      setStep(2);
      return;
    }
    
    const payload = {
      ...data,
      amount: Number(data.amount),
      categories: data.categories?.map((c: any) => ({
        ...c,
        allocation_amount: c.allocation_amount ? Number(c.allocation_amount) : undefined
      }))
    };
    
    mutate(payload);
  };

  const handleNext = async () => {
    const isValid = await form.trigger(
      initialData 
        ? ['budget_id', 'type', 'name', 'amount', 'start_date', 'end_date', 'recurrence', 'is_global'] 
        : ['type', 'name', 'amount', 'start_date', 'end_date', 'recurrence', 'is_global']
    );
    if (isValid) setStep(2);
  };

  const handleBack = () => setStep(1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <WizardBasicStep 
            form={form} 
            selectedCurrency={selectedCurrency} 
            isSubmitting={isSubmitting} 
            isGlobal={isGlobal} 
            initialData={initialData} 
            onNext={handleNext} 
          />
        )}

        {step === 2 && !isGlobal && (
          <WizardCategoryStep 
            form={form} 
            categories={categories} 
            selectedCurrency={selectedCurrency} 
            isSubmitting={isSubmitting} 
            initialData={initialData} 
            onBack={handleBack} 
          />
        )}
      </form>
    </Form>
  );
}
