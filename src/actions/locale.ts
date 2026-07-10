'use server';

import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from '@/utils/locale';

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}
