'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { CalendarIcon, GlobeIcon, TagIcon } from 'lucide-react';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { deleteBudgetAction } from '@/features/budgets/actions';
import { useActionMutation } from '@/hooks/use-action-mutation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Edit2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ActionDialog } from '@/components/shared/action-dialog';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { CreateBudgetWizard } from '@/features/budgets/components/create-budget-wizard';
import { CategoryWithChildren, Currency } from '@/types/models';
import { useState } from 'react';

// Quick interface to match Supabase return
export interface BudgetData {
  budget_id: string;
  name: string;
  description: string;
  amount: number;
  spent_amount: number;
  currency_code: string;
  start_date: string;
  end_date: string;
  is_global: boolean;
  type: string;
  recurrence: string;
  budget_categories: {
    category_id: string;
    allocation_amount: number;
    categories: {
      category_name: string;
      color: string;
      icon: string;
    }
  }[];
}

interface BudgetCardProps {
  budget: BudgetData;
  categories: CategoryWithChildren[];
  currencyCode: string;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
}

export function BudgetCard({ budget, categories, currencyCode, currencies }: BudgetCardProps) {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  
  const absoluteSpent = Math.abs(budget.spent_amount);
  const percentage = budget.amount > 0 ? (absoluteSpent / budget.amount) * 100 : 0;
  const isOverbudget = percentage > 100;
  
  const startDate = new Date(budget.start_date);
  const endDate = new Date(budget.end_date);
  
  const isActive = isWithinInterval(new Date(), { start: startDate, end: endDate });
  const isEnded = isPast(endDate) && !isActive;

  const { mutate: deleteBudget, isPending } = useActionMutation<{ budgetId: string }, any, any>(
    {
      // Mock form object to satisfy useActionMutation signature
      handleSubmit: (fn: any) => fn,
      control: null,
      getValues: () => ({}),
      setValue: () => {},
      watch: () => {},
      reset: () => {},
    } as any, 
    {
      action: async (data: { budgetId: string }) => deleteBudgetAction(data.budgetId),
      successMessage: () => t('budgets.deletedSuccess' as any),
      errorMessage: () => t('budgets.failedDelete' as any),
    }
  );

  const handleDelete = () => {
    deleteBudget({ budgetId: budget.budget_id });
  };

  // Calculate progress
  const isIncome = budget.type === 'income';
  let progressColor = "bg-primary";
  if (isIncome) {
    if (percentage >= 100) progressColor = "bg-emerald-500";
    else if (percentage >= 75) progressColor = "bg-emerald-400";
  } else {
    if (percentage > 100) progressColor = "bg-destructive";
    else if (percentage > 85) progressColor = "bg-amber-500";
  }
  
  // Custom progress width capping at 100% for the visual bar
  const visualPercentage = Math.min(percentage, 100);

  return (
    <Card className={`relative overflow-hidden transition-all ${isEnded ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {budget.name}
            {budget.is_global ? (
              <Badge variant="secondary" className="h-5 text-[10px] uppercase"><GlobeIcon className="h-3 w-3 mr-1" /> Global</Badge>
            ) : (
              <Badge variant="outline" className="h-5 text-[10px] uppercase"><TagIcon className="h-3 w-3 mr-1" /> Categories</Badge>
            )}
            {isEnded && <Badge variant="destructive" className="h-5 text-[10px]">Ended</Badge>}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
            {budget.recurrence !== 'none' && (
              <span className="ml-2 capitalize border-l pl-2 border-border">{budget.recurrence}</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditDrawerOpen(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(absoluteSpent, budget.currency_code, 'en-US')}
            </div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <span>{isIncome ? t('budgets.earned' as any) : t('budgets.spent' as any)} {formatCurrency(budget.amount, budget.currency_code, 'en-US')}</span>
            </div>
          </div>
          <div className="text-right">
            {isOverbudget ? (
              <Badge variant={isIncome ? "default" : "destructive"} className={isIncome ? "bg-emerald-500" : "animate-pulse"}>
                {isIncome ? t('budgets.overTarget' as any) : t('budgets.overbudget' as any)}
              </Badge>
            ) : percentage === 100 && isIncome ? (
              <Badge variant="default" className="bg-emerald-500">{t('budgets.goalReached' as any)}</Badge>
            ) : (
              <div className="text-sm font-medium text-emerald-500">
                {formatCurrency(budget.amount - absoluteSpent, budget.currency_code, 'en-US')} {isIncome ? t('budgets.remainingTarget' as any) : t('budgets.left' as any)}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1 text-right">
               {percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-3 w-full bg-secondary overflow-hidden rounded-full mt-3">
          <div 
            className={`h-full transition-all duration-500 ease-in-out rounded-full ${progressColor}`} 
            style={{ width: `${visualPercentage}%` }} 
          />
        </div>

        {/* Optional Subcategories visual */}
        {!budget.is_global && budget.budget_categories.length > 0 && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
             {budget.budget_categories.map((bc) => (
                <Badge key={bc.category_id} variant="secondary" className="text-xs font-normal">
                  {bc.categories?.category_name} 
                  {bc.allocation_amount ? ` (${formatCurrency(bc.allocation_amount, budget.currency_code || currencyCode, 'en-US')})` : ''}
                </Badge>
             ))}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <Link href={`/budgets/${budget.budget_id}`}>
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
              {t('budgets.detailsTitle' as any)} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>

      <ActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('budgets.deleteConfirmTitle' as any)}
        description={t('budgets.deleteConfirmDescription' as any)}
        actionText={t('common.delete')}
        cancelText={t('common.cancel')}
        onAction={handleDelete}
        isPending={isPending}
        destructive
      />

      <ResponsiveDrawer
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        title={t('budgets.updateBudget' as any)}
        description={t('budgets.description' as any)}
      >
        <div className="p-4 md:p-6 h-full overflow-y-auto">
          <CreateBudgetWizard 
            categories={categories}
            onSuccess={() => setEditDrawerOpen(false)}
            currencyCode={currencyCode}
            currencies={currencies}
            initialData={budget}
          />
        </div>
      </ResponsiveDrawer>
    </Card>
  );
}
