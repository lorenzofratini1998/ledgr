'use server';

import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from '@/utils/locale';
import { cookies } from 'next/headers';

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}
