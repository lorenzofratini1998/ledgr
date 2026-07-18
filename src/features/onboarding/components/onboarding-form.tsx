'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import { OnboardingPayload } from '@/features/onboarding/schemas';
import { EcosystemStep } from './ecosystem-step';
import { PreferencesStep } from './preferences-step';

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
  step1_title?: string;
  step2_title?: string;
  ecosystem_title?: string;
  ecosystem_subtitle?: string;
  categories_section_title?: string;
  categories_section_desc?: string;
  categories_select_all?: string;
  categories_deselect_all?: string;
  wallet_section_title?: string;
  wallet_section_desc?: string;
  wallet_name_label?: string;
  wallet_name_placeholder?: string;
  wallet_type_label?: string;
  wallet_balance_label?: string;
  btn_skip?: string;
  btn_finish?: string;
  btn_cancel?: string;
  btn_add_wallet?: string;
  default_categories?: Record<string, string>;
}

interface OnboardingFormProps {
  languages: Language[];
  currencies: Currency[];
  defaultLocale?: string;
  defaultCurrencyCode?: string;
  dict: OnboardingDictionary;
  initialStep?: 1 | 2;
}

export function OnboardingForm({ languages, currencies, defaultLocale, defaultCurrencyCode, dict, initialStep = 1 }: OnboardingFormProps) {
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [primaryCurrencyCode, setPrimaryCurrencyCode] = useState<string>(defaultCurrencyCode || '');

  const handlePreferencesSuccess = (data: OnboardingPayload) => {
    setPrimaryCurrencyCode(data.primary_currency_code);
    setStep(2);
  };

  return (
    <div className="w-full flex justify-center">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <PreferencesStep
            key="step1"
            languages={languages}
            currencies={currencies}
            defaultLocale={defaultLocale || languages[0]?.locale || 'en-US'}
            defaultCurrencyCode={primaryCurrencyCode}
            dict={dict}
            onSuccess={handlePreferencesSuccess}
          />
        )}
        {step === 2 && (
          <EcosystemStep
            key="step2"
            currencies={currencies}
            primaryCurrencyCode={primaryCurrencyCode}
            dict={dict}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
