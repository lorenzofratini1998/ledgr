'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Currency } from '@/types/models';

interface WizardBasicStepProps {
  form: UseFormReturn<any>;
  selectedCurrency?: Pick<Currency, 'iso_code' | 'name' | 'symbol'>;
  isSubmitting: boolean;
  isGlobal: boolean;
  initialData?: any;
  onNext: () => void;
}

export function WizardBasicStep({ form, selectedCurrency, isSubmitting, isGlobal, initialData, onNext }: WizardBasicStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense">{t('budgets.typeExpense' as any)}</TabsTrigger>
                  <TabsTrigger value="income">{t('budgets.typeIncome' as any)}</TabsTrigger>
                </TabsList>
              </Tabs>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('common.name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('budgets.namePlaceholder') as string} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budgets.amountLabel')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    {selectedCurrency?.symbol || '$'}
                  </div>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    placeholder="0.00" 
                    className="pl-8 text-lg font-medium"
                    {...field} 
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.includes('.')) {
                        const parts = val.split('.');
                        if (parts[1].length > 2) {
                          val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                        }
                      }
                      field.onChange(val);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      const val = e.target.value;
                      if (val && !isNaN(Number(val))) {
                        form.setValue("amount", Number(val).toFixed(2), { shouldValidate: true });
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budgets.recurrenceLabel')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('budgets.recurrenceNone')}>
                      {field.value === 'weekly'
                        ? t('budgets.recurrenceWeekly')
                        : field.value === 'monthly' 
                          ? t('budgets.recurrenceMonthly') 
                          : field.value === 'yearly' 
                            ? t('budgets.recurrenceYearly') 
                            : t('budgets.recurrenceNone')}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t('budgets.recurrenceNone')}</SelectItem>
                  <SelectItem value="weekly">{t('budgets.recurrenceWeekly')}</SelectItem>
                  <SelectItem value="monthly">{t('budgets.recurrenceMonthly')}</SelectItem>
                  <SelectItem value="yearly">{t('budgets.recurrenceYearly')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budgets.startDate')}</FormLabel>
              <FormControl>
                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} onChange={e => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('budgets.endDate')}</FormLabel>
              <FormControl>
                <Input type="date" value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} onChange={e => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="is_global"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                {t('budgets.isGlobal')}
              </FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {isGlobal ? (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting 
            ? t(initialData ? 'budgets.updating' as any : 'budgets.creating' as any) 
            : t(initialData ? 'budgets.updateBudget' as any : 'budgets.createBudget' as any)}
        </Button>
      ) : (
        <Button type="button" className="w-full" onClick={onNext}>
          {t('common.next')}
        </Button>
      )}
    </div>
  );
}
