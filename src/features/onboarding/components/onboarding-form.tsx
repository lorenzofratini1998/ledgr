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


interface OnboardingFormProps {
  languages: Language[];
  currencies: Currency[];
  defaultLocale?: string;
  defaultCurrencyCode?: string;
  initialStep?: 1 | 2;
}

export function OnboardingForm({ languages, currencies, defaultLocale, defaultCurrencyCode, initialStep = 1 }: OnboardingFormProps) {
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
            onSuccess={handlePreferencesSuccess}
          />
        )}
        {step === 2 && (
          <EcosystemStep
            key="step2"
            currencies={currencies}
            primaryCurrencyCode={primaryCurrencyCode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
