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

export interface CurrencySelectorDictionary {
  currency_placeholder?: string;
  currency_search?: string;
  currency_not_found?: string;
  currency_popular?: string;
  currency_all?: string;
}

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  popularCurrencyCodes?: string[];
  dict?: CurrencySelectorDictionary;
  className?: string;
  trigger?: React.ReactElement;
}

export function CurrencySelector({
  value,
  onValueChange,
  currencies,
  popularCurrencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
  dict = {},
  className,
  trigger
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = currencies.find((c) => c.iso_code === value);

  const popularCurrencies = currencies.filter(c => popularCurrencyCodes.includes(c.iso_code));
  const otherCurrencies = currencies.filter(c => !popularCurrencyCodes.includes(c.iso_code));

  const placeholder = dict.currency_placeholder || "Select currency";
  const searchPlaceholder = dict.currency_search || "Search currency...";
  const notFoundText = dict.currency_not_found || "No currency found.";
  const popularHeading = dict.currency_popular || "Popular";
  const allHeading = dict.currency_all || "All Currencies";

  const defaultTrigger = (
    <Button
      variant="outline"
      role="combobox"
      className={cn(
        "w-full justify-between font-normal",
        !value && "text-muted-foreground",
        className
      )}
    >
      {selected
        ? `${selected.iso_code} - ${selected.name} (${selected.symbol})`
        : placeholder}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
