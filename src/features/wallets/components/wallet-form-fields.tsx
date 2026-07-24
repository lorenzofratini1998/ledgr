'use client';

import { ColorPicker } from '@/components/shared/color-picker';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { IconPicker } from '@/components/shared/icon-picker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Currency } from '@/types/models';
import { useFormContext } from 'react-hook-form';

import { WALLET_COLOR_MAP, WALLET_COLORS, WALLET_ICON_MAP, WALLET_ICONS } from '@/features/wallets/constants';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

const colorOptions = WALLET_COLORS.map(key => ({
  value: key,
  bgClass: WALLET_COLOR_MAP[key].bg,
}));

const iconOptions = WALLET_ICONS.map(key => ({
  value: key,
  icon: WALLET_ICON_MAP[key],
}));

interface WalletFormFieldsProps {
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  // Prefix to support nested forms (like ecosystemSchema.wallet)
  fieldPrefix?: string;
  isEditMode?: boolean;
}

export function WalletFormFields({ currencies, fieldPrefix = '', isEditMode = false }: WalletFormFieldsProps) {
  const { t } = useTranslation();
  const form = useFormContext();

  const getFieldName = (name: string) => fieldPrefix ? `${fieldPrefix}.${name}` : name;

  const selectedCurrencyCode = form.watch(getFieldName('currency_code'));
  const selectedCurrency = currencies.find(c => c.iso_code === selectedCurrencyCode);

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name={getFieldName('name')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('wallets.walletName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('wallets.mainAccountPlaceholder') as string} {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('type')}
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel>{t('wallets.type')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('wallets.selectType')}>
                      {field.value ? t(`wallets.types.${field.value}` as TranslationKey) : null}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="regular">{t('wallets.types.regular')}</SelectItem>
                  <SelectItem value="savings">{t('wallets.types.savings')}</SelectItem>
                  <SelectItem value="investment">{t('wallets.types.investment')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name={getFieldName('color')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('common.color')}</FormLabel>
            <FormControl>
              <ColorPicker
                value={field.value || ''}
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
        name={getFieldName('icon')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('common.icon')}</FormLabel>
            <FormControl>
              <IconPicker
                value={field.value || ''}
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
        name={getFieldName('description')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('common.description')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span></FormLabel>
            <FormControl>
              <Textarea
                placeholder={t('wallets.descriptionPlaceholder') as string}
                className="resize-none"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('initial_balance')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('wallets.initialBalance')}</FormLabel>
            <FormControl>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                  {selectedCurrency?.symbol || '$'}
                </div>
                <Input type="text" placeholder="0.00" className="pl-8" {...field} value={field.value || ''} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('currency_code')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('wallets.currency')}</FormLabel>
            <FormControl>
              <CurrencySelector
                value={field.value}
                onValueChange={field.onChange}
                currencies={currencies}
                disabled={isEditMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('exclude_from_net_worth')}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 pr-4">
              <FormLabel className="text-base">
                {t('wallets.excludeFromNetWorth')}
              </FormLabel>
              <FormDescription>
                {t('wallets.excludeFromNetWorthDesc')}
              </FormDescription>
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
    </div>
  );
}
