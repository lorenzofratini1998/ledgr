'use client';

import { Button } from '@/components/ui/button';
import { Form, } from '@/components/ui/form';
import { createWalletAction, updateWalletAction } from '@/features/wallets/actions';
import {
  DEFAULT_WALLET_THEMES,
} from '@/features/wallets/constants';
import { CreateWalletPayload, CreateWalletSchema } from '@/features/wallets/schemas';
import { useActionMutation } from '@/hooks/use-action-mutation';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Currency, Wallet } from '@/types/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { WalletFormFields } from './wallet-form-fields';

interface WalletFormProps {
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode?: string;
  initialData?: Wallet;
  onSuccess?: () => void;
}

export function WalletForm({ currencies, defaultCurrencyCode = 'USD', initialData, onSuccess }: WalletFormProps) {
  const { t } = useTranslation();

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
      exclude_from_net_worth: initialData?.exclude_from_net_worth || false,
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
    successMessage: (res) => res.message || (initialData ? t('wallets.updatedSuccess') : t('wallets.createdSuccess')),
    errorMessage: (res) => res.message || t('common.error'),
    resetOnSuccess: !initialData,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const onSubmit = (data: CreateWalletPayload) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <WalletFormFields currencies={currencies} isEditMode={!!initialData} />

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isPending} size="lg">
            {isPending ? (initialData ? t('wallets.saving') : t('wallets.creating')) : (initialData ? t('common.saveChanges') : t('wallets.createWallet'))}
          </Button>
        </div>
      </form>
    </Form>
  );
}
