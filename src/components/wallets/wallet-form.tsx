'use client';

import { useTransition, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWalletSchema, CreateWalletPayload } from '@/lib/schemas/wallets';
import { createWalletAction, updateWalletAction } from '@/actions/wallets';
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
import { DEFAULT_WALLET_THEMES, WalletColor, WalletIcon } from '@/lib/constants/wallets';
import { toast } from 'sonner';

import { WALLET_COLOR_MAP, WALLET_ICON_MAP } from '@/components/wallets/config';
import { WALLET_COLORS, WALLET_ICONS } from '@/lib/constants/wallets';

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
  const [isPending, startTransition] = useTransition();

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

  const onSubmit = (data: CreateWalletPayload) => {
    startTransition(async () => {
      let result;
      try {
        if (initialData) {
          result = await updateWalletAction(initialData.id, data);
        } else {
          result = await createWalletAction(data);
        }

        if (result.success) {
          toast.success(result.message || (initialData ? 'Wallet updated successfully' : 'Wallet created successfully'));
          if (!initialData) {
            form.reset();
          }
          onSuccess?.();
        } else {
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              form.setError(field as Parameters<typeof form.setError>[0], {
                type: 'server',
                message: (messages as string[])[0],
              });
            });
          }
          toast.error(result.message || 'An error occurred');
        }
      } catch (error) {
        toast.error('An unexpected error occurred. Please try again.');
      }
    });
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
              <FormLabel>Wallet Name</FormLabel>
              <FormControl>
                <Input placeholder="Main Account" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => {
            const typeLabels: Record<string, string> = {
              regular: 'Account / Card',
              savings: 'Savings',
              investment: 'Investment'
            };

            return (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type">
                        {field.value ? typeLabels[field.value] : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="regular">Account / Card</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
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
              <FormLabel>Color</FormLabel>
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
              <FormLabel>Icon</FormLabel>
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
              <FormLabel>Description <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="E.g., Bank of America checking account"
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
              <FormLabel>Initial Balance</FormLabel>
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
              <FormLabel>Currency</FormLabel>
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
            {isPending ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Wallet')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
