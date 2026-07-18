import { LOCALE_COOKIE_NAME } from '@/utils/locale';
import { cookies } from "next/headers";
import 'server-only';
import { type Dictionary } from './dictionaries/en';

const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.en),
  it: () => import('./dictionaries/it').then((module) => module.it),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};

export async function getLocaleDictionary(): Promise<{
  locale: Locale;
  dictionary: Dictionary;
}> {
  const cookieStore = await cookies();
  const fullLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || "en";
  const locale = fullLocale.split('-')[0] as Locale;
  const dictionary = await getDictionary(locale);
  return { locale, dictionary };
}

