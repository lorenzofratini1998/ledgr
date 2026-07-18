'use client';

import { ColorPicker } from '@/components/shared/color-picker';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { IconPicker } from '@/components/shared/icon-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Currency } from '@/types/models';
import { useFormContext } from 'react-hook-form';

import { WALLET_COLOR_MAP, WALLET_COLORS, WALLET_ICON_MAP, WALLET_ICONS } from '@/features/wallets/constants';
import { useDictionary } from '@/i18n/dictionary-provider';

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
}

export function WalletFormFields({ currencies, fieldPrefix = '' }: WalletFormFieldsProps) {
  const dictionary = useDictionary();
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
            <FormLabel>{dictionary.wallets.walletName}</FormLabel>
            <FormControl>
              <Input placeholder={dictionary.wallets.mainAccountPlaceholder} {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={getFieldName('type')}
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
        name={getFieldName('color')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{dictionary.common.color}</FormLabel>
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
            <FormLabel>{dictionary.common.icon}</FormLabel>
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
            <FormLabel>{dictionary.common.description} <span className="text-muted-foreground font-normal">{dictionary.common.optional}</span></FormLabel>
            <FormControl>
              <Textarea
                placeholder={dictionary.wallets.descriptionPlaceholder}
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
            <FormLabel>{dictionary.wallets.initialBalance}</FormLabel>
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
    </div>
  );
}
