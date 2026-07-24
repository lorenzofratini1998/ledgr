'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, } from '@/components/ui/form';
import { useActionMutation } from '@/hooks/use-action-mutation';

import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP } from '@/features/categories/constants';
import { completeEcosystemOnboarding } from '@/features/onboarding/actions';
import { EcosystemPayload, ecosystemSchema } from '@/features/onboarding/schemas';
import { WalletFormFields } from '@/features/wallets/components/wallet-form-fields';
import { DEFAULT_ONBOARDING_CATEGORIES, DefaultCategoryKey } from '../constants';
import { useTranslation } from '@/i18n/hooks/use-translation';

interface Currency {
  iso_code: string;
  name: string;
  symbol: string;
}

interface EcosystemStepProps {
  currencies: Currency[];
  primaryCurrencyCode: string;

}

export function EcosystemStep({ currencies, primaryCurrencyCode }: EcosystemStepProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showWallet, setShowWallet] = useState(false);

  const form = useForm({
    resolver: zodResolver(ecosystemSchema),
    defaultValues: {
      categories: [], // None selected by default
      wallet: {
        name: '',
        type: 'regular',
        initial_balance: '0.00',
        currency_code: primaryCurrencyCode,
        color: 'slate',
        icon: 'wallet',
        description: ''
      }
    },
  });

  const { mutate, isPending } = useActionMutation(form, {
    action: completeEcosystemOnboarding,
    successMessage: (res) => res.message || 'Workspace setup successfully',
    errorMessage: (res) => res.message || 'Something went wrong',
    onSuccess: () => {
      router.refresh();
      router.push('/');
    }
  });

  function onSubmit(data: EcosystemPayload) {
    // If they toggled off the wallet, or left the name empty, omit the wallet entirely
    if (!showWallet || !data.wallet?.name?.trim()) {
      mutate({ ...data, wallet: null });
    } else {
      mutate(data);
    }
  }

  function onSkip() {
    mutate({ categories: [], wallet: null });
  }

  const selectedCategories = form.watch('categories');
  const allCategoryKeys = Object.keys(DEFAULT_ONBOARDING_CATEGORIES) as DefaultCategoryKey[];

  const toggleCategory = (key: string) => {
    const current = new Set(form.getValues('categories'));
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    form.setValue('categories', Array.from(current), { shouldValidate: true });
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === allCategoryKeys.length) {
      form.setValue('categories', [], { shouldValidate: true });
    } else {
      form.setValue('categories', allCategoryKeys, { shouldValidate: true });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-8 w-full max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          {t('onboarding.ecosystem_title')}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t('onboarding.ecosystem_subtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-8">
            
            {/* Top: Categories */}
            <Card>
              <CardHeader className="pb-4 border-b">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{t('onboarding.categories_section_title')}</CardTitle>
                    <CardDescription className="mt-1">{t('onboarding.categories_section_desc')}</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      if (selectedCategories.length === allCategoryKeys.length) {
                        form.setValue('categories', []);
                      } else {
                        form.setValue('categories', allCategoryKeys);
                      }
                    }}
                  >
                    {selectedCategories.length === allCategoryKeys.length 
                      ? t('onboarding.categories_deselect_all') 
                      : t('onboarding.categories_select_all')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {allCategoryKeys.map((key) => {
                    const cat = DEFAULT_ONBOARDING_CATEGORIES[key];
                    const Icon = CATEGORY_ICON_MAP[cat.icon];
                    const colorClasses = CATEGORY_COLOR_MAP[cat.color];
                    const isSelected = selectedCategories.includes(key);
                    // @ts-ignore dynamic indexing
                    const translatedName = t(`onboarding.default_categories.${key}` as any) || key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCategory(key)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' 
                            : 'border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-foreground' : colorClasses.text}`} />
                        <span className="text-sm font-medium">{translatedName}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Bottom: Wallet */}
            <Card>
              <CardHeader className="pb-4 border-b flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{t('onboarding.wallet_section_title')}</CardTitle>
                  <CardDescription>{t('onboarding.wallet_section_desc')}</CardDescription>
                </div>
                <Button
                  type="button"
                  variant={showWallet ? "ghost" : "secondary"}
                  onClick={() => setShowWallet(!showWallet)}
                  className="shrink-0"
                >
                  {showWallet ? t('onboarding.btn_cancel') : "+ " + t('onboarding.btn_add_wallet')}
                </Button>
              </CardHeader>
              <AnimatePresence>
                {showWallet && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-6 space-y-4">
                      <WalletFormFields currencies={currencies} fieldPrefix="wallet" />
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 bg-muted/30 p-6 rounded-2xl border">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto order-2 sm:order-1 text-muted-foreground"
              disabled={isPending}
              onClick={onSkip}
            >
              {t('onboarding.btn_skip')}
            </Button>
            
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto order-1 sm:order-2 px-8"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('onboarding.btn_saving')}
                </>
              ) : (
                t('onboarding.btn_finish')
              )}
            </Button>
          </div>

        </form>
      </Form>
    </motion.div>
  );
}
