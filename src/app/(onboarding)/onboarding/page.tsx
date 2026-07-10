import { getActiveLanguages } from '@/data/languages';
import { getActiveCurrencies } from '@/data/currencies';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { getLocaleDictionary } from '@/i18n/get-dictionary';
import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME } from '@/utils/locale';

export default async function OnboardingPage() {
  const { activeLocales, defaultLocale } = await getActiveLanguages();
  const currencies = await getActiveCurrencies();
  const { dictionary } = await getLocaleDictionary();

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  
  const currentLocale = cookieLocale && activeLocales.some(l => l.locale === cookieLocale) 
    ? cookieLocale 
    : defaultLocale || 'en-US';

  const defaultCurrency = currencies.find(c => (c as any).is_default)?.iso_code || 'EUR';

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 md:p-10 bg-muted/50">
      <div className="w-full max-w-5xl">
        <OnboardingForm
          languages={activeLocales}
          currencies={currencies}
          defaultLocale={currentLocale}
          defaultCurrencyCode={defaultCurrency}
          dict={dictionary.onboarding}
        />
      </div>
    </div>
  );
}
