'use client';

import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowRight, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { createTransactionAction, updateTransactionAction } from '../actions';
import { CreateTransactionPayload, createTransactionSchema } from '../schemas';
import { TransactionTypeToggle } from '@/components/shared/transaction-type-toggle';
import { SubmitButton } from '@/components/shared/submit-button';
import { TagSelector } from '@/components/shared/tag-selector';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { CategorySelect } from '@/components/shared/category-select';
import { Currency, Tag, CategoryOption, QuickTransactionWithDetails } from '@/types/models';
import { createQuickTransactionAction } from '@/features/quick-transactions/actions';
import { Sparkles } from 'lucide-react';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';

interface TransactionFormProps {
  wallets: { id: string; name: string; currency_code: string; type?: string; is_default: boolean }[];
  categories: CategoryOption[];
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  tags: Tag[];
  defaultCurrency: string;
  quickTransactions?: QuickTransactionWithDetails[];
  initialData?: {
    transaction_id: string;
    amount: string;
    date: string;
    description: string;
    type: 'income' | 'expense' | 'transfer';
    currency_code: string;
    wallet_id: string;
    destination_wallet_id?: string | null;
    destination_amount?: string | null;
    fee?: string | null;
    transfer_id?: string | null;
    category_id: string;
    tags: string[];
  };
  onSuccess?: () => void;
}

export function TransactionForm({
  wallets,
  categories,
  currencies,
  tags,
  defaultCurrency,
  quickTransactions = [],
  initialData,
  onSuccess,
}: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [keepOpen, setKeepOpen] = useState(false);
  const [saveAsQuick, setSaveAsQuick] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const defaultWalletId = wallets.find((w) => w.is_default)?.id || wallets[0]?.id || '';
  const secondWalletId = wallets.find((w) => w.id !== defaultWalletId)?.id || '';

  const form = useForm<CreateTransactionPayload>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: initialData || {
      type: 'expense',
      amount: '',
      currency_code: defaultCurrency,
      wallet_id: defaultWalletId,
      destination_wallet_id: secondWalletId,
      destination_amount: '',
      fee: '',
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      description: '',
      tags: [],
    },
  });

  const transactionType = form.watch('type');
  const selectedWalletId = form.watch('wallet_id');
  const selectedDestWalletId = form.watch('destination_wallet_id');
  const selectedCurrencyCode = form.watch('currency_code');

  const selectedSourceWallet = wallets.find((w) => w.id === selectedWalletId);
  const selectedDestWallet = wallets.find((w) => w.id === selectedDestWalletId);

  // Synchronize source currency with selected wallet currency if user changes source wallet
  useEffect(() => {
    if (selectedSourceWallet && !initialData) {
      form.setValue('currency_code', selectedSourceWallet.currency_code);
    }
  }, [selectedWalletId, selectedSourceWallet, form, initialData]);

  const selectedCurrency = currencies.find((c) => c.iso_code === selectedCurrencyCode);
  const destCurrency = currencies.find((c) => c.iso_code === selectedDestWallet?.currency_code);

  const isCrossCurrency =
    transactionType === 'transfer' &&
    selectedDestWallet &&
    selectedSourceWallet &&
    selectedSourceWallet.currency_code !== selectedDestWallet.currency_code;

  // Filter selectable wallets based on business rules (RF-06.2: savings wallets disabled for direct expenses)
  const selectableSourceWallets =
    transactionType === 'expense'
      ? wallets.filter((w) => w.type !== 'savings' || w.id === initialData?.wallet_id)
      : wallets;

  const selectableDestWallets = wallets.filter((w) => w.id !== selectedWalletId);

  const handleSelectTemplate = (tmpl: QuickTransactionWithDetails) => {
    form.setValue('type', tmpl.type as 'expense' | 'income');
    form.setValue('amount', String(tmpl.amount));
    form.setValue('wallet_id', tmpl.wallet_id);
    form.setValue('currency_code', tmpl.currency_code);
    form.setValue('category_id', tmpl.category_id || '');
    form.setValue('description', tmpl.description || tmpl.name);
  };

  const onSubmit = (data: CreateTransactionPayload) => {
    startTransition(async () => {
      const payload: CreateTransactionPayload = {
        ...data,
        category_id: data.type === 'transfer' ? null : (data.category_id || null),
      };

      const response = initialData
        ? await updateTransactionAction(initialData.transaction_id, payload)
        : await createTransactionAction(payload);

      if (response.success) {
        toast.success(response.message);

        // Optionally save as quick transaction template
        if (saveAsQuick && !initialData && data.type !== 'transfer') {
          await createQuickTransactionAction({
            name: data.description.slice(0, 50),
            wallet_id: data.wallet_id,
            category_id: data.category_id || null,
            amount: data.amount,
            currency_code: data.currency_code,
            type: data.type as 'expense' | 'income',
            description: data.description,
          });
        }

        form.reset({
          ...data,
          category_id: data.category_id || '',
          amount: '',
          destination_amount: '',
          fee: '',
          description: '',
          tags: [],
        });
        setSaveAsQuick(false);
        router.refresh();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Quick Templates Prefill Chips */}
        {!initialData && quickTransactions.length > 0 && (
          <div className="space-y-1.5 pb-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('quickTransactions.title')}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickTransactions.map((tmpl) => {
                const catIconKey = (tmpl.category?.icon as CategoryIcon) || 'tag';
                const IconComp = CATEGORY_ICON_MAP[catIconKey] || CATEGORY_ICON_MAP.tag;
                const colorKey = (tmpl.category?.color as CategoryColor) || 'slate';
                const colorConfig = CATEGORY_COLOR_MAP[colorKey] || CATEGORY_COLOR_MAP.slate;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg border bg-muted/40 hover:bg-muted text-xs font-medium shrink-0 transition-colors shadow-2xs"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-white shrink-0 ${colorConfig.bg}`}>
                      <IconComp className="w-2.5 h-2.5" />
                    </div>
                    <span>{tmpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Type Selector (Segmented Control via Tabs) */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TransactionTypeToggle value={field.value} onValueChange={field.onChange} />
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
              <FormLabel>{t('common.amount')}</FormLabel>
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
                        form.setValue('amount', Number(val).toFixed(2), { shouldValidate: true });
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Destination Amount if Cross-Currency Transfer */}
        {isCrossCurrency && (
          <FormField
            control={form.control}
            name="destination_amount"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-top-1 duration-200">
                <FormLabel>{t('transactions.destinationAmount')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                      {destCurrency?.symbol || '$'}
                    </div>
                    <Input
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="pl-8 font-medium"
                      value={field.value || ''}
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
                          form.setValue('destination_amount', Number(val).toFixed(2), { shouldValidate: true });
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Currency (only when not in simple transfer where wallet determines currency) */}
        <FormField
          control={form.control}
          name="currency_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.currency')}</FormLabel>
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
              <FormLabel>{t('common.description')}</FormLabel>
              <FormControl>
                <Input placeholder={t('transactions.descriptionPlaceholder') as string} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Wallet Selection */}
        {transactionType === 'transfer' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Wallet */}
            <FormField
              control={form.control}
              name="wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transactions.fromWallet')}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('transactions.selectWallet')}>
                          <span className="truncate block text-left">
                            {field.value ? wallets.find((w) => w.id === field.value)?.name : null}
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

            {/* Destination Wallet */}
            <FormField
              control={form.control}
              name="destination_wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transactions.toWallet')}</FormLabel>
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('transactions.selectWallet')}>
                          <span className="truncate block text-left">
                            {field.value ? wallets.find((w) => w.id === field.value)?.name : null}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableDestWallets.map((wallet) => (
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
          </div>
        ) : (
          /* Standard Single Wallet */
          <FormField
            control={form.control}
            name="wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.wallet')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('transactions.selectWallet')}>
                        <span className="truncate block text-left">
                          {field.value ? wallets.find((w) => w.id === field.value)?.name : null}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectableSourceWallets.map((wallet) => (
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
        )}

        {/* Date and Fee grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.date')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional Transfer Fee */}
          {transactionType === 'transfer' && (
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('transactions.feeOptional')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                        {selectedCurrency?.symbol || '$'}
                      </div>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-8"
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Category (Only for Income / Expense) */}
        {transactionType !== 'transfer' ? (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common.categoryOptional')}</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onValueChange={field.onChange}
                    categories={categories}
                    placeholder={t('transactions.selectCategory')}
                    allowEmpty={true}
                    emptyLabel={t('transactions.uncategorized')}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{t('transactions.noCategoryNeeded')}</span>
          </div>
        )}

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common.tagsOptional')}</FormLabel>
              <FormControl>
                <TagSelector tags={tags} selectedIds={field.value || []} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Keep Open and Save as Quick Switches (Only for Create) */}
        {!initialData && (
          <div className="space-y-3 py-1">
            <div className="flex items-center space-x-3">
              <Switch id="keep-open" checked={keepOpen} onCheckedChange={setKeepOpen} />
              <Label htmlFor="keep-open" className="text-sm font-normal cursor-pointer">
                {t('transactions.saveAndAddAnother')}
              </Label>
            </div>

            {transactionType !== 'transfer' && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/20">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="flex flex-col">
                    <Label htmlFor="save-as-quick" className="text-xs font-medium cursor-pointer">
                      {t('quickTransactions.saveAsQuick')}
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      {quickTransactions.length >= 5
                        ? t('quickTransactions.limitReached')
                        : t('quickTransactions.saveAsQuickDesc')}
                    </span>
                  </div>
                </div>
                <Switch
                  id="save-as-quick"
                  checked={saveAsQuick}
                  disabled={quickTransactions.length >= 5}
                  onCheckedChange={setSaveAsQuick}
                />
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <SubmitButton isPending={isPending} loadingText={t('common.saving')} className="mt-2">
          {initialData ? t('transactions.updateTransaction') : t('transactions.saveTransaction')}
        </SubmitButton>
      </form>
    </Form>
  );
}

