'use client';

import { useState, useTransition } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Loader2, AlertTriangle, Wallet, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { onboardingSchema, OnboardingPayload } from '@/lib/schemas/onboarding.schema';
import { completeBasicOnboarding } from '@/actions/onboarding';
import { setLocale } from '@/actions/locale';
import { PreviewCard } from './preview-card';

interface Currency {
  iso_code: string;
  name: string;
  symbol: string;
}

interface Language {
  locale: string;
  native_name: string;
}

export interface OnboardingDictionary {
  welcome_title: string;
  welcome_subtitle: string;
  theme_label: string;
  theme_placeholder: string;
  theme_light: string;
  theme_dark: string;
  theme_system: string;
  language_label: string;
  language_placeholder: string;
  date_format_label: string;
  date_format_placeholder: string;
  currency_label: string;
  currency_placeholder: string;
  currency_search: string;
  currency_not_found: string;
  currency_popular: string;
  currency_all: string;
  currency_description: string;
  important_title: string;
  important_description_1: string;
  important_description_bold: string;
  important_description_2: string;
  btn_saving: string;
  btn_submit: string;
  preview_net_worth: string;
  preview_checking: string;
  preview_savings: string;
}

interface OnboardingFormProps {
  languages: Language[];
  currencies: Currency[];
  defaultLocale?: string;
  defaultCurrencyCode?: string;
  dict: OnboardingDictionary;
}

const POPULAR_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];

export function OnboardingForm({ languages, currencies, defaultLocale, defaultCurrencyCode, dict }: OnboardingFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPendingLang, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OnboardingPayload>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      theme: 'system',
      date_format: 'DD/MM/YYYY',
      language_locale: defaultLocale || languages[0]?.locale || 'en-US',
      primary_currency_code: defaultCurrencyCode || '',
    },
  });

  const popularCurrencies = currencies.filter(c => POPULAR_CURRENCY_CODES.includes(c.iso_code));
  const otherCurrencies = currencies.filter(c => !POPULAR_CURRENCY_CODES.includes(c.iso_code));

  async function onSubmit(data: OnboardingPayload) {
    setIsPending(true);
    setError(null);

    const result = await completeBasicOnboarding(data);

    if (!result.success) {
      setError(result.error || 'Something went wrong');
      setIsPending(false);
      return;
    }

    // Refresh and redirect to dashboard
    router.refresh();
    router.push('/');
  }

  const theme = form.watch('theme');
  const dateFormat = form.watch('date_format');
  const currencyCode = form.watch('primary_currency_code');
  const languageLocale = form.watch('language_locale');

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          {dict.welcome_title}
        </h1>
        <p className="text-muted-foreground text-lg">
          {dict.welcome_subtitle}
        </p>
      </div>

      {/* Two-Column Grid centered vertically */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-center">

        {/* Left Side: Live Preview */}
        <div className="order-1 lg:order-1">
          <PreviewCard
            theme={theme}
            dateFormat={dateFormat}
            currencyCode={currencyCode}
            languageLocale={languageLocale}
            dict={dict}
          />
        </div>

        {/* Right Side: Form wrapped in a Card */}
        <div className="order-2 lg:order-2">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dict.theme_label}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={dict.theme_placeholder}>
                                {field.value === 'light' ? dict.theme_light : field.value === 'dark' ? dict.theme_dark : field.value === 'system' ? dict.theme_system : ''}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">{dict.theme_light}</SelectItem>
                            <SelectItem value="dark">{dict.theme_dark}</SelectItem>
                            <SelectItem value="system">{dict.theme_system}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language_locale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dict.language_label}</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            startTransition(async () => {
                              if (val) {
                                await setLocale(val);
                                router.refresh();
                              }
                            });
                          }}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={dict.language_placeholder}>
                                {languages.find(l => l.locale === field.value)?.native_name}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.locale} value={lang.locale}>
                                {lang.native_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dict.date_format_label}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={dict.date_format_placeholder}>
                                {field.value}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primary_currency_code"
                    render={({ field }) => {
                      const selected = currencies.find((c) => c.iso_code === field.value);
                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>{dict.currency_label}</FormLabel>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {selected
                                      ? `${selected.iso_code} - ${selected.name} (${selected.symbol})`
                                      : dict.currency_placeholder}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              }
                            />
                            <PopoverContent className="w-[300px] lg:w-[400px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder={dict.currency_search} />
                                <CommandList>
                                  <CommandEmpty>{dict.currency_not_found}</CommandEmpty>
                                  <CommandGroup heading={dict.currency_popular}>
                                    {popularCurrencies.map((currency) => (
                                      <CommandItem
                                        value={`${currency.iso_code} ${currency.name}`}
                                        key={currency.iso_code}
                                        onSelect={() => {
                                          form.setValue("primary_currency_code", currency.iso_code, { shouldValidate: true });
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            currency.iso_code === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {currency.iso_code} - {currency.name} ({currency.symbol})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                  <CommandSeparator />
                                  <CommandGroup heading={dict.currency_all}>
                                    {otherCurrencies.map((currency) => (
                                      <CommandItem
                                        value={`${currency.iso_code} ${currency.name}`}
                                        key={currency.iso_code}
                                        onSelect={() => {
                                          form.setValue("primary_currency_code", currency.iso_code, { shouldValidate: true });
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            currency.iso_code === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
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
                          <FormDescription>
                            {dict.currency_description}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <Alert className="border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 mt-2">
                    <AlertTriangle className="h-4 w-4 stroke-orange-600 dark:stroke-orange-400" />
                    <AlertTitle>{dict.important_title}</AlertTitle>
                    <AlertDescription>
                      {dict.important_description_1} <strong>{dict.important_description_bold}</strong>{dict.important_description_2}
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-fit self-center min-w-[200px] mt-6" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {dict.btn_saving}
                      </>
                    ) : (
                      dict.btn_submit
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
