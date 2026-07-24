'use client';

import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputGroup } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { createTransactionAction, updateTransactionAction } from '../actions';
import { CreateTransactionPayload, createTransactionSchema } from '../schemas';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { TagSelector } from '@/components/shared/tag-selector';
import { Currency, Tag } from '@/types/models';

interface TransactionFormProps {
  wallets: { id: string; name: string; currency_code: string; is_default: boolean }[];
  categories: { category_id: string; category_name: string }[];
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  tags: Tag[];
  defaultCurrency: string;
  initialData?: {
    transaction_id: string;
    amount: string;
    date: string;
    description: string;
    type: 'income' | 'expense';
    currency_code: string;
    wallet_id: string;
    category_id: string;
    tags: string[];
  };
  onSuccess?: () => void;
}

export function TransactionForm({ wallets, categories, currencies, tags, defaultCurrency, initialData, onSuccess }: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [keepOpen, setKeepOpen] = useState(false);

  const defaultWalletId = wallets.find((w) => w.is_default)?.id || wallets[0]?.id || '';

  const form = useForm<CreateTransactionPayload>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: initialData || {
      type: 'expense',
      amount: '',
      currency_code: defaultCurrency,
      wallet_id: defaultWalletId,
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      description: '',
      tags: [],
    },
  });

  const selectedCurrencyCode = form.watch('currency_code');
  const selectedCurrency = currencies.find(c => c.iso_code === selectedCurrencyCode);

  const onSubmit = (data: CreateTransactionPayload) => {
    startTransition(async () => {
      const response = initialData
        ? await updateTransactionAction(initialData.transaction_id, data)
        : await createTransactionAction(data);

      if (response.success) {
        toast.success(response.message);
        form.reset({
          ...data,
          category_id: data.category_id || '',
          amount: '',
          description: '',
          tags: [],
        });
        if (!keepOpen && onSuccess) onSuccess();
      } else {
        toast.error(response.message);
        if (response.errors) {
          Object.entries(response.errors).forEach(([key, messages]) => {
            form.setError(key as any, { message: messages[0] });
          });
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Type Selector (Segmented Control via Tabs) */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="expense" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600">
                      Expense
                    </TabsTrigger>
                    <TabsTrigger value="income" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600">
                      Income
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    {selectedCurrency?.symbol || '$'}
                  </div>
                  <Input 
                    placeholder="0.00" 
                    type="number" 
                    step="0.01" 
                    min="0.01"
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

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <CurrencySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  currencies={currencies}
                  hideIcon
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Groceries, Salary, Coffee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wallet */}
          <FormField
            control={form.control}
            name="wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select wallet">
                        <span className="truncate block text-left">
                          {field.value ? wallets.find(w => w.id === field.value)?.name : null}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Picker (Native for Mobile First UX) */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        <span className="truncate block text-left">
                          {field.value ? categories.find(c => c.category_id === field.value)?.category_name : null}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <TagSelector
                  tags={tags}
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keep Open Switch (Only for Create) */}
        {!initialData && (
          <div className="flex items-center space-x-3 py-1">
            <Switch id="keep-open" checked={keepOpen} onCheckedChange={setKeepOpen} />
            <Label htmlFor="keep-open" className="text-sm font-normal cursor-pointer">
              Save & add another
            </Label>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Transaction' : 'Save Transaction'
          )}
        </Button>
      </form>
    </Form>
  );
}
