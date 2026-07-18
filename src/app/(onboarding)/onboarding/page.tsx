import { getActiveCurrencies } from '@/data/currencies';
import { getActiveLanguages } from '@/data/languages';
import { OnboardingForm } from '@/features/onboarding/components/onboarding-form';
import { getLocaleDictionary } from '@/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import { LOCALE_COOKIE_NAME } from '@/utils/locale';
import { cookies } from 'next/headers';

export default async function OnboardingPßßage() {
  const { activeLocales, defaultLocale } = await getActiveLanguages();
  const currencies = await getActiveCurrencies();
  const { dictionary } = await getLocaleDictionary();

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  const currentLocale = cookieLocale && activeLocales.some(l => l.locale === cookieLocale)
    ? cookieLocale
    : defaultLocale || 'en-US';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let prefs = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
    if (profile) {
      const { data } = await supabase.from('user_preferences').select('*').eq('profile_id', profile.id).single();
      prefs = data;
    }
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
          dict={dictionary.onboarding}
          initialStep={initialStep as 1 | 2}
        />
      </div>
    </div>
  );
}
