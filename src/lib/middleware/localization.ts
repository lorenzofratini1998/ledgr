import { NextRequest, NextResponse } from "next/server";
import { resolveLocale, LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from "@/utils/locale";
import { getActiveLanguages } from "@/data/languages";

export async function applyLocalization(request: NextRequest, response: NextResponse) {
  const { activeLocales, defaultLocale } = await getActiveLanguages();

  const existingCookie = request.cookies.get(LOCALE_COOKIE_NAME);

  if (existingCookie && activeLocales.some(l => l.locale === existingCookie.value)) {
    return;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const locale = resolveLocale(acceptLanguage, activeLocales.map(l => l.locale), defaultLocale);

  response.cookies.set(LOCALE_COOKIE_NAME, locale, LOCALE_COOKIE_OPTIONS);
}
