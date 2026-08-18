'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateQuickTransactionPayload,
  createQuickTransactionSchema,
  MAX_QUICK_TRANSACTIONS,
} from '../schemas';
import {
  createQuickTransactionAction,
  updateQuickTransactionAction,
  deleteQuickTransactionAction,
} from '../actions';
import { QuickTransactionWithDetails, CategoryOption, Currency } from '@/types/models';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CategorySelect } from '@/components/shared/category-select';
import { WalletSelect } from '@/components/shared/wallet-select';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubmitButton } from '@/components/shared/submit-button';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Sparkles, Layers, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';

interface QuickTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quickTransactions: QuickTransactionWithDetails[];
  wallets: { id: string; name: string; currency_code: string; type?: string; is_default: boolean }[];
  categories: CategoryOption[];
  currencies?: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrency?: string;
  initialEditingTemplate?: QuickTransactionWithDetails | null;
}

export function QuickTransactionDialog({
  open,
  onOpenChange,
  quickTransactions,
  wallets,
  categories,
  currencies = [],
  defaultCurrency = 'EUR',
  initialEditingTemplate = null,
}: QuickTransactionDialogProps) {
  const { t } = useTranslation();
  const [editingTemplate, setEditingTemplate] = useState<QuickTransactionWithDetails | null>(
    initialEditingTemplate
  );
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(!editingTemplate && quickTransactions.length === 0);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const defaultWallet = wallets.find((w) => w.is_default) || wallets[0];

  const form = useForm<CreateQuickTransactionPayload>({
    resolver: zodResolver(createQuickTransactionSchema),
    defaultValues: {
      name: editingTemplate?.name || '',
      wallet_id: editingTemplate?.wallet_id || defaultWallet?.id || '',
      category_id: editingTemplate?.category_id || '',
      amount: editingTemplate ? String(editingTemplate.amount) : '',
      currency_code: editingTemplate?.currency_code || defaultWallet?.currency_code || defaultCurrency,
      type: (editingTemplate?.type as 'expense' | 'income') || 'expense',
      description: editingTemplate?.description || '',
      display_order: editingTemplate?.display_order || quickTransactions.length,
    },
  });

  const selectedCurrencyCode = form.watch('currency_code');
  const selectedCurrency = currencies?.find((c) => c.iso_code === selectedCurrencyCode) || {
    iso_code: selectedCurrencyCode,
    name: selectedCurrencyCode,
    symbol: selectedCurrencyCode === 'EUR' ? '€' : selectedCurrencyCode === 'USD' ? '$' : selectedCurrencyCode,
  };

  // Sync currency code when wallet changes
  const handleWalletChange = (walletId: string) => {
    form.setValue('wallet_id', walletId);
    const w = wallets.find((item) => item.id === walletId);
    if (w) {
      form.setValue('currency_code', w.currency_code);
    }
  };

  const startEdit = (template: QuickTransactionWithDetails) => {
    setEditingTemplate(template);
    setIsCreatingNew(true);
    form.reset({
      name: template.name,
      wallet_id: template.wallet_id,
      category_id: template.category_id || '',
      amount: String(template.amount),
      currency_code: template.currency_code,
      type: template.type as 'expense' | 'income',
      description: template.description || '',
      display_order: template.display_order,
    });
  };

  const startCreate = () => {
    setEditingTemplate(null);
    setIsCreatingNew(true);
    form.reset({
      name: '',
      wallet_id: defaultWallet?.id || '',
      category_id: '',
      amount: '',
      currency_code: defaultWallet?.currency_code || defaultCurrency,
      type: 'expense',
      description: '',
      display_order: quickTransactions.length,
    });
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      const res = await deleteQuickTransactionAction(id);
      if (res.success) {
        toast.success(t('quickTransactions.deletedSuccess'));
        if (editingTemplate?.id === id) {
          setEditingTemplate(null);
          setIsCreatingNew(false);
        }
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsDeletingId(null);
    }
  };

  const onSubmit = async (data: CreateQuickTransactionPayload) => {
    if (editingTemplate) {
      const res = await updateQuickTransactionAction({
        id: editingTemplate.id,
        ...data,
      });
      if (res.success) {
        toast.success(t('quickTransactions.updatedSuccess'));
        setEditingTemplate(null);
        setIsCreatingNew(false);
      } else {
        toast.error(res.message);
      }
    } else {
      if (quickTransactions.length >= MAX_QUICK_TRANSACTIONS) {
        toast.error(t('quickTransactions.limitReached'));
        return;
      }
      const res = await createQuickTransactionAction(data);
      if (res.success) {
        toast.success(t('quickTransactions.createdSuccess'));
        setIsCreatingNew(false);
        form.reset();
      } else {
        toast.error(res.message);
      }
    }
  };

  const canAddNew = quickTransactions.length < MAX_QUICK_TRANSACTIONS;

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) {
          setEditingTemplate(null);
          setIsCreatingNew(false);
        }
      }}
      title={
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{t('quickTransactions.title')}</span>
          </div>
          <Badge variant={quickTransactions.length >= MAX_QUICK_TRANSACTIONS ? 'destructive' : 'secondary'}>
            {t('quickTransactions.slotsUsed', {
              count: quickTransactions.length,
              max: MAX_QUICK_TRANSACTIONS,
            })}
          </Badge>
        </div>
      }
      description={t('quickTransactions.description')}
    >
      <div className="space-y-6 pt-2">
        {/* Existing Templates Management List */}
        {!isCreatingNew && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t('quickTransactions.manageTemplates')}
              </span>
              {canAddNew && (
                <Button size="sm" onClick={startCreate} className="gap-1">
                  <Plus className="w-4 h-4" />
                  {t('quickTransactions.addTemplate')}
                </Button>
              )}
            </div>

            {quickTransactions.length === 0 ? (
              <div className="text-center py-8 px-4 border rounded-xl border-dashed space-y-3">
                <Layers className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-sm">{t('quickTransactions.noTemplates')}</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {t('quickTransactions.noTemplatesDesc')}
                </p>
                <Button size="sm" onClick={startCreate} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('quickTransactions.addTemplate')}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {quickTransactions.map((item) => {
                  const catIconKey = (item.category?.icon as CategoryIcon) || 'tag';
                  const IconComp = CATEGORY_ICON_MAP[catIconKey] || CATEGORY_ICON_MAP.tag;
                  const colorKey = (item.category?.color as CategoryColor) || 'slate';
                  const colorConfig = CATEGORY_COLOR_MAP[colorKey] || CATEGORY_COLOR_MAP.slate;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-card transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${colorConfig.bg}`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.wallet?.name || 'Wallet'} • {formatCurrency(Number(item.amount), item.currency_code)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => startEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={isDeletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Form */}
        {isCreatingNew && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {quickTransactions.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingTemplate(null);
                  }}
                  title={t('common.cancel')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <h3 className="text-sm font-semibold">
                {editingTemplate ? t('quickTransactions.editTemplate') : t('quickTransactions.addTemplate')}
              </h3>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Tabs
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as 'expense' | 'income')}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                              value="expense"
                              className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500"
                            >
                              {t('quickTransactions.expense')}
                            </TabsTrigger>
                            <TabsTrigger
                              value="income"
                              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500"
                            >
                              {t('quickTransactions.income')}
                            </TabsTrigger>
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
                      <FormLabel>{t('quickTransactions.nameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('quickTransactions.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount and Currency Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quickTransactions.amountLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                              {selectedCurrency?.symbol || '€'}
                            </div>
                            <Input
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="pl-8 text-base font-medium"
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

                  {currencies && currencies.length > 0 ? (
                    <FormField
                      control={form.control}
                      name="currency_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.currency')}</FormLabel>
                          <FormControl>
                            <CurrencySelector
                              currencies={currencies}
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </div>

                {/* Wallet and Category Select */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="wallet_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quickTransactions.walletLabel')}</FormLabel>
                        <FormControl>
                          <WalletSelect
                            wallets={wallets}
                            value={field.value}
                            onValueChange={handleWalletChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('quickTransactions.categoryLabel')}</FormLabel>
                        <FormControl>
                          <CategorySelect
                            categories={categories}
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            allowEmpty={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('quickTransactions.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('quickTransactions.descriptionPlaceholder')}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  {quickTransactions.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingTemplate(null);
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  )}
                  <SubmitButton
                    isPending={form.formState.isSubmitting}
                    loadingText={t('quickTransactions.saving')}
                    className="w-full"
                  >
                    {editingTemplate ? t('quickTransactions.editTemplate') : t('quickTransactions.addTemplate')}
                  </SubmitButton>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </ResponsiveDrawer>
  );
}

