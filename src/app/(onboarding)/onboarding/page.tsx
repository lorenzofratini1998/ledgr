import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getActiveLanguages } from '@/lib/constants/languages';
import { OnboardingForm } from '@/features/onboarding/components/onboarding-form';
import { getUserPreferences } from '@/features/preferences/queries';
import { createClient } from '@/lib/supabase/server';
import { LOCALE_COOKIE_NAME } from '@/i18n/utils';
import { cookies } from 'next/headers';

export default async function OnboardingPage() {
  const { activeLocales, defaultLocale } = await getActiveLanguages();
  const currencies = await getActiveCurrencies();

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  const currentLocale = cookieLocale && activeLocales.some(l => l.locale === cookieLocale)
    ? cookieLocale
    : defaultLocale || 'en-US';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let prefs = null;
  if (user) {
    prefs = await getUserPreferences(user.id);
  }

  const defaultCurrency = prefs?.primary_currency_code ||
    currencies.find(c => (c as any).is_default)?.iso_code ||
    'EUR';

  const initialStep = prefs?.primary_currency_code ? 2 : 1;

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 md:p-10 bg-muted/50">
      <div className="w-full max-w-5xl">
        <OnboardingForm
          languages={activeLocales}
          currencies={currencies}
          defaultLocale={currentLocale}
          defaultCurrencyCode={defaultCurrency}
          initialStep={initialStep as 1 | 2}
        />
      </div>
    </div>
  );
}
