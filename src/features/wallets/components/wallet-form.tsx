'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWalletSchema, CreateWalletPayload } from '@/features/wallets/schemas';
import { createWalletAction, updateWalletAction } from '@/features/wallets/actions';
import { useActionMutation } from '@/hooks/use-action-mutation';
import { Currency, Wallet } from '@/types/models';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { Textarea } from '@/components/ui/textarea';
import { ColorPicker } from '@/components/shared/color-picker';
import { IconPicker } from '@/components/shared/icon-picker';
import { DEFAULT_WALLET_THEMES, WalletColor, WalletIcon } from '@/features/wallets/constants';

import { WALLET_COLOR_MAP, WALLET_ICON_MAP } from '@/features/wallets/constants';
import { WALLET_COLORS, WALLET_ICONS } from '@/features/wallets/constants';
import { useDictionary } from '@/i18n/dictionary-provider';

const colorOptions = WALLET_COLORS.map(key => ({
  value: key,
  bgClass: WALLET_COLOR_MAP[key].bg,
}));

const iconOptions = WALLET_ICONS.map(key => ({
  value: key,
  icon: WALLET_ICON_MAP[key],
}));

interface WalletFormProps {
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode?: string;
  initialData?: Wallet;
  onSuccess?: () => void;
}

export function WalletForm({ currencies, defaultCurrencyCode = 'USD', initialData, onSuccess }: WalletFormProps) {
  const dictionary = useDictionary();

  const form = useForm({
    resolver: zodResolver(CreateWalletSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: (initialData?.type as CreateWalletPayload["type"]) || 'regular',
      initial_balance: initialData?.initial_balance ? initialData.initial_balance.toString() : '0.00',
      currency_code: initialData?.currency_code || defaultCurrencyCode,
      color: initialData?.color || DEFAULT_WALLET_THEMES['regular'].color,
      icon: initialData?.icon || DEFAULT_WALLET_THEMES['regular'].icon,
    },
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    // Only auto-update theme if we are not editing, or if the user actually changes the type manually
    // To keep it simple, if initialData is present, we only change if form.formState.dirtyFields.type is true
    if (!initialData || form.formState.dirtyFields.type) {
      const defaultTheme = DEFAULT_WALLET_THEMES[selectedType];
      if (defaultTheme) {
        form.setValue('color', defaultTheme.color);
        form.setValue('icon', defaultTheme.icon);
      }
    }
  }, [selectedType, form, initialData]);

  const { mutate, isPending } = useActionMutation(form, {
    action: (data: CreateWalletPayload) => {
      if (initialData) {
        return updateWalletAction(initialData.id, data);
      }
      return createWalletAction(data);
    },
    successMessage: (res) => res.message || (initialData ? dictionary.wallets.updatedSuccess : dictionary.wallets.createdSuccess),
    errorMessage: (res) => res.message || dictionary.common.error,
    resetOnSuccess: !initialData,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const onSubmit = (data: CreateWalletPayload) => {
    mutate(data);
  };

  const selectedCurrencyCode = form.watch('currency_code');
  const selectedCurrency = currencies.find(c => c.iso_code === selectedCurrencyCode);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.wallets.walletName}</FormLabel>
              <FormControl>
                <Input placeholder={dictionary.wallets.mainAccountPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => {
            const typeLabels: Record<string, string> = dictionary.wallets.types as Record<string, string>;

            return (
              <FormItem>
                <FormLabel>{dictionary.wallets.type}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={dictionary.wallets.selectType}>
                        {field.value ? typeLabels[field.value] : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="regular">{dictionary.wallets.types.regular}</SelectItem>
                    <SelectItem value="savings">{dictionary.wallets.types.savings}</SelectItem>
                    <SelectItem value="investment">{dictionary.wallets.types.investment}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.color}</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value}
                  onValueChange={field.onChange}
                  options={colorOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.icon}</FormLabel>
              <FormControl>
                <IconPicker
                  value={field.value}
                  onValueChange={field.onChange}
                  options={iconOptions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.common.description} <span className="text-muted-foreground font-normal">{dictionary.common.optional}</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder={dictionary.wallets.descriptionPlaceholder}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initial_balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.wallets.initialBalance}</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    {selectedCurrency?.symbol || '$'}
                  </div>
                  <Input type="text" placeholder="0.00" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dictionary.wallets.currency}</FormLabel>
              <FormControl>
                <CurrencySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  currencies={currencies}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isPending} size="lg">
            {isPending ? (initialData ? dictionary.wallets.saving : dictionary.wallets.creating) : (initialData ? dictionary.common.saveChanges : dictionary.wallets.createWallet)}
          </Button>
        </div>
      </form>
    </Form>
  );
}
