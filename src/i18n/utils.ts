export function resolveLocale(
  acceptLanguage: string | null,
  activeLocales: string[],
  defaultLocale: string
): string {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const preferredLocales = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase())
    .map(lang => lang.split('-')[0]);

  for (const lang of preferredLocales) {
    if (activeLocales.includes(lang)) {
      return lang;
    }
  }

  return defaultLocale;
}

export const LOCALE_COOKIE_NAME = 'LOCALE';

export const LOCALE_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
};
