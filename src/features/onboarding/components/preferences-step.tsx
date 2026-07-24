'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { CurrencySelector } from '@/components/shared/currency-selector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActionMutation } from '@/hooks/use-action-mutation';

import { setLocale } from '@/i18n/actions';
import { completeBasicOnboarding } from '@/features/onboarding/actions';
import { OnboardingPayload, onboardingSchema } from '@/features/onboarding/schemas';
import { useTranslation } from '@/i18n/hooks/use-translation';
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

interface PreferencesStepProps {
  languages: Language[];
  currencies: Currency[];
  defaultLocale: string;
  defaultCurrencyCode: string;

  onSuccess: (data: OnboardingPayload) => void;
}

const POPULAR_CURRENCY_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];

export function PreferencesStep({ languages, currencies, defaultLocale, defaultCurrencyCode, onSuccess }: PreferencesStepProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPendingLang, startTransition] = useTransition();

  const form = useForm<OnboardingPayload>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      theme: 'system',
      date_format: 'DD/MM/YYYY',
      language_locale: defaultLocale,
      primary_currency_code: defaultCurrencyCode,
    },
  });

  const { mutate, isPending } = useActionMutation(form, {
    action: completeBasicOnboarding,
    successMessage: (res) => res.message || 'Preferences saved successfully',
    errorMessage: (res) => res.message || 'Something went wrong',
    onSuccess: () => {
      // Refresh to ensure server components know about the locale changes
      router.refresh();
      // Pass the data up to the parent to move to Step 2
      onSuccess(form.getValues());
    }
  });

  function onSubmit(data: OnboardingPayload) {
    mutate(data);
  }

  const theme = form.watch('theme');
  const dateFormat = form.watch('date_format');
  const currencyCode = form.watch('primary_currency_code');
  const languageLocale = form.watch('language_locale');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-8 w-full"
    >
      {/* Centered Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          {t('onboarding.welcome_title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.welcome_subtitle')}
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
          />
        </div>

        {/* Right Side: Form wrapped in a Card */}
        <div className="order-2 lg:order-2">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-6 w-full">


                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('onboarding.theme_label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('onboarding.theme_placeholder')}>
                                {field.value === 'light' ? t('onboarding.theme_light') : field.value === 'dark' ? t('onboarding.theme_dark') : field.value === 'system' ? t('onboarding.theme_system') : ''}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">{t('onboarding.theme_light')}</SelectItem>
                            <SelectItem value="dark">{t('onboarding.theme_dark')}</SelectItem>
                            <SelectItem value="system">{t('onboarding.theme_system')}</SelectItem>
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
                        <FormLabel>{t('onboarding.language_label')}</FormLabel>
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
                              <SelectValue placeholder={t('onboarding.language_placeholder')}>
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
                        <FormLabel>{t('onboarding.date_format_label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t('onboarding.date_format_placeholder')}>
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
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('onboarding.currency_label')}</FormLabel>
                        <FormControl>
                          <CurrencySelector
                            value={field.value}
                            onValueChange={(val) => form.setValue("primary_currency_code", val, { shouldValidate: true })}
                            currencies={currencies}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('onboarding.currency_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert className="border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400 mt-2">
                    <AlertTriangle className="h-4 w-4 stroke-orange-600 dark:stroke-orange-400" />
                    <AlertTitle>{t('onboarding.important_title')}</AlertTitle>
                    <AlertDescription>
                      {t('onboarding.important_description_1')} <strong>{t('onboarding.important_description_bold')}</strong>{t('onboarding.important_description_2')}
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-fit self-center min-w-[200px] mt-6" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('onboarding.btn_saving')}
                      </>
                    ) : (
                      t('onboarding.btn_submit')
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
