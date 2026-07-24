'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Currency } from '@/types/models';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from '@/i18n/hooks/use-translation';

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  popularCurrencyCodes?: string[];

  className?: string;
  trigger?: React.ReactElement;
  disabled?: boolean;
  hideIcon?: boolean;
}

export function CurrencySelector({
  value,
  onValueChange,
  currencies,
  popularCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
  className,
  trigger,
  disabled,
  hideIcon = false
}: CurrencySelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = currencies.find((c) => c.iso_code === value);

  const popularCurrencies = currencies.filter(c => popularCurrencyCodes.includes(c.iso_code));
  const otherCurrencies = currencies.filter(c => !popularCurrencyCodes.includes(c.iso_code));

  const placeholder = t('onboarding.currency_placeholder');
  const searchPlaceholder = t('onboarding.currency_search');
  const notFoundText = t('onboarding.currency_not_found');
  const popularHeading = t('onboarding.currency_popular');
  const allHeading = t('onboarding.currency_all');

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
      className={cn(
        "w-full justify-between font-normal",
        !value && "text-muted-foreground",
        className
      )}
      disabled={disabled}
    >
      {selected
        ? `${selected.iso_code} - ${selected.name} (${selected.symbol})`
        : placeholder}
      {!hideIcon && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger || defaultTrigger} />
      <PopoverContent className="w-[300px] lg:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup heading={popularHeading}>
              {popularCurrencies.map((currency) => (
                <CommandItem
                  value={`${currency.iso_code} ${currency.name}`}
                  key={currency.iso_code}
                  onSelect={() => {
                    onValueChange(currency.iso_code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currency.iso_code === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {currency.iso_code} - {currency.name} ({currency.symbol})
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={allHeading}>
              {otherCurrencies.map((currency) => (
                <CommandItem
                  value={`${currency.iso_code} ${currency.name}`}
                  key={currency.iso_code}
                  onSelect={() => {
                    onValueChange(currency.iso_code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currency.iso_code === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {currency.iso_code} - {currency.name} ({currency.symbol})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
