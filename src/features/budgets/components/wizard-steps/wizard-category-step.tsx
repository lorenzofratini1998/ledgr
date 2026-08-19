'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryWithChildren, Currency } from '@/types/models';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

interface CategoryAllocationRowProps {
  category: any;
  isSelected: boolean;
  allocationAmount: number | string;
  onToggle: (checked: boolean) => void;
  onAmountChange: (value: string) => void;
  budgetAmount: number;
  isChild?: boolean;
}

function CategoryAllocationRow({
  category,
  isSelected,
  allocationAmount,
  onToggle,
  onAmountChange,
  budgetAmount,
  isChild = false
}: CategoryAllocationRowProps) {
  const { t } = useTranslation();
  
  const IconComponent = (LucideIcons as Record<string, any>)[category.icon || 'HelpCircle'] || HelpCircle;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border",
      isSelected ? "bg-primary/5 border-primary/20" : "bg-card",
      isChild ? "ml-6" : ""
    )}>
      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
        <Checkbox 
          id={`cat-${category.category_id}`} 
          checked={isSelected}
          onCheckedChange={onToggle}
        />
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20`, color: category.color }}
        >
          <IconComponent size={16} />
        </div>
        <label 
          htmlFor={`cat-${category.category_id}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {category.category_name}
        </label>
      </div>

      {isSelected && (
        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
          <div className="relative w-full sm:w-24 shrink-0">
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-8 text-right pr-6"
              value={allocationAmount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          </div>
          
          <span className="text-muted-foreground text-xs shrink-0 w-4 text-center">o</span>
          
          <div className="relative w-full sm:w-20 shrink-0">
            <Input
              type="number"
              step="1"
              min="0"
              max="100"
              placeholder="0"
              className="h-8 text-right pr-6"
              value={
                budgetAmount > 0 && allocationAmount 
                  ? Math.round((Number(allocationAmount) / budgetAmount) * 100).toString() 
                  : ''
              }
              onChange={(e) => {
                const percentage = Number(e.target.value);
                if (percentage >= 0 && percentage <= 100 && budgetAmount > 0) {
                  const calculatedAmount = (budgetAmount * (percentage / 100)).toFixed(2);
                  onAmountChange(calculatedAmount);
                } else if (e.target.value === '') {
                  onAmountChange('');
                }
              }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface WizardCategoryStepProps {
  form: UseFormReturn<any>;
  categories: CategoryWithChildren[];
  selectedCurrency?: Pick<Currency, 'iso_code' | 'name' | 'symbol'>;
  isSubmitting: boolean;
  initialData?: any;
  onBack: () => void;
}

export function WizardCategoryStep({ form, categories, selectedCurrency, isSubmitting, initialData, onBack }: WizardCategoryStepProps) {
  const { t } = useTranslation();

  const budgetAmount = form.watch('amount') || 0;
  const currentAllocations = form.watch('categories') || [];
  const selectedCategoryIds = currentAllocations.map((c: any) => c.category_id);
  const totalAllocated = currentAllocations.reduce((sum: number, cat: any) => sum + (Number(cat.allocation_amount) || 0), 0);

  const toggleCategory = (categoryId: string, checked: boolean, childrenIds?: string[]) => {
    const current = form.getValues('categories') || [];
    let next = [...current];

    const idsToToggle = [categoryId, ...(childrenIds || [])];

    if (checked) {
      idsToToggle.forEach(id => {
        if (!next.find((c: any) => c.category_id === id)) {
          next.push({ category_id: id });
        }
      });
    } else {
      next = next.filter((c: any) => !idsToToggle.includes(c.category_id));
    }
    
    form.setValue('categories', next);
  };

  const updateAllocation = (categoryId: string, amount: number | string) => {
    const current = form.getValues('categories') || [];
    form.setValue('categories', current.map((c: any) => 
      c.category_id === categoryId ? { ...c, allocation_amount: amount } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg flex items-center justify-between sticky top-0 z-10 shadow-sm border">
        <div>
          <p className="text-sm font-medium">{t('budgets.totalBudget' as any)}</p>
          <p className="text-2xl font-bold">{formatCurrency(budgetAmount, selectedCurrency?.iso_code || 'USD')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{t('budgets.allocated' as any)}</p>
          <p className={cn(
            "text-lg font-bold",
            totalAllocated > budgetAmount ? "text-destructive" : "text-emerald-500"
          )}>
            {formatCurrency(totalAllocated, selectedCurrency?.iso_code || 'USD')}
          </p>
          {totalAllocated > budgetAmount && (
            <p className="text-xs text-destructive mt-1">{t('budgets.overAllocated' as any)}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
        {categories.map(parentCat => {
          const isParentSelected = selectedCategoryIds.includes(parentCat.category_id);
          const parentAllocation = currentAllocations.find((c: any) => c.category_id === parentCat.category_id)?.allocation_amount || '';
          const childrenIds = parentCat.children?.map(c => c.category_id) || [];

          return (
            <div key={parentCat.category_id} className="space-y-2">
              <CategoryAllocationRow
                category={parentCat}
                isSelected={isParentSelected}
                allocationAmount={parentAllocation}
                budgetAmount={budgetAmount}
                onToggle={(checked) => toggleCategory(parentCat.category_id, checked, childrenIds)}
                onAmountChange={(val) => updateAllocation(parentCat.category_id, val)}
              />

              {parentCat.children && parentCat.children.length > 0 && parentCat.children.map(childCat => {
                const isChildSelected = selectedCategoryIds.includes(childCat.category_id);
                const childAllocation = currentAllocations.find((c: any) => c.category_id === childCat.category_id)?.allocation_amount || '';

                return (
                  <CategoryAllocationRow
                    key={childCat.category_id}
                    category={childCat}
                    isSelected={isChildSelected}
                    allocationAmount={childAllocation}
                    budgetAmount={budgetAmount}
                    onToggle={(checked) => toggleCategory(childCat.category_id, checked)}
                    onAmountChange={(val) => updateAllocation(childCat.category_id, val)}
                    isChild={true}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || totalAllocated > budgetAmount}
        >
          {isSubmitting 
            ? t(initialData ? 'budgets.updating' as any : 'budgets.creating' as any) 
            : t(initialData ? 'budgets.updateBudget' as any : 'budgets.createBudget' as any)}
        </Button>
      </div>
    </div>
  );
}
