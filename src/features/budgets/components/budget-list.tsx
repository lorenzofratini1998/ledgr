'use client';
import { useState } from 'react';

import { useTranslation } from '@/i18n/hooks/use-translation';
import { BudgetData, BudgetCard } from './budget-card';
import { LayersIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isPast, isWithinInterval, getYear, endOfDay } from 'date-fns';

import { CategoryWithChildren, Currency } from '@/types/models';

interface BudgetListProps {
  budgets: BudgetData[];
  categories: CategoryWithChildren[];
  currencyCode: string;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
}

const BudgetGrid = ({ budgetsList, categories, currencyCode, currencies }: { budgetsList: BudgetData[] } & Omit<BudgetListProps, 'budgets'>) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {budgetsList.map((budget) => (
      <BudgetCard 
        key={budget.budget_id} 
        budget={budget} 
        categories={categories}
        currencyCode={currencyCode}
        currencies={currencies}
      />
    ))}
  </div>
);

export function BudgetList({ budgets, categories, currencyCode, currencies }: BudgetListProps) {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>('all');

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <LayersIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{t('budgets.noBudgetsFound')}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {t('budgets.noBudgetsDescription')}
        </p>
      </div>
    );
  }

  const activeBudgets = budgets.filter(b => {
    const start = new Date(b.start_date);
    const end = endOfDay(new Date(b.end_date));
    const isEnded = isPast(end) && !isWithinInterval(new Date(), { start, end });
    return !isEnded;
  });

  const pastBudgets = budgets.filter(b => {
    const start = new Date(b.start_date);
    const end = endOfDay(new Date(b.end_date));
    const isEnded = isPast(end) && !isWithinInterval(new Date(), { start, end });
    return isEnded;
  });

  const availableYears = Array.from(new Set(pastBudgets.map(b => getYear(new Date(b.end_date)).toString()))).sort((a, b) => Number(b) - Number(a));

  const filteredPastBudgets = selectedYear === 'all' 
    ? pastBudgets 
    : pastBudgets.filter(b => getYear(new Date(b.end_date)).toString() === selectedYear);

  return (
    <Tabs defaultValue="active" className="w-full space-y-6">
      <div className="w-full">
        <TabsList className="w-full h-11">
          <TabsTrigger value="active" className="flex-1 text-sm">
            {t('budgets.active' as any) || 'Active'}
            <span className="ml-2 bg-muted-foreground/10 text-foreground py-0.5 px-2 rounded-full text-xs">
              {activeBudgets.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 text-sm">
            {t('budgets.past' as any) || 'Past'}
            <span className="ml-2 bg-muted-foreground/10 text-foreground py-0.5 px-2 rounded-full text-xs">
              {pastBudgets.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="active" className="mt-0">
        {activeBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20">
            <p className="text-sm text-muted-foreground">{t('budgets.noActiveBudgets' as any) || 'No active budgets found.'}</p>
          </div>
        ) : (
          <BudgetGrid budgetsList={activeBudgets} categories={categories} currencyCode={currencyCode} currencies={currencies} />
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0 space-y-4">
        {pastBudgets.length > 0 && (
          <div className="flex justify-end">
            <Select value={selectedYear} onValueChange={(val) => val && setSelectedYear(val)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year">
                  {selectedYear === 'all' ? (t('budgets.allYears' as any) || 'All Years') : selectedYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('budgets.allYears' as any)}</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredPastBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20">
            <p className="text-sm text-muted-foreground">{t('budgets.noPastBudgets' as any) || 'No past budgets found.'}</p>
          </div>
        ) : (
          <BudgetGrid budgetsList={filteredPastBudgets} categories={categories} currencyCode={currencyCode} currencies={currencies} />
        )}
      </TabsContent>
    </Tabs>
  );
}
