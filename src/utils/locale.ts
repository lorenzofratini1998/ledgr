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
