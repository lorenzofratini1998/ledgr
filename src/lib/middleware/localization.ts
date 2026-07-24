import { getActiveLanguages } from "@/lib/constants/languages";
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS, resolveLocale } from "@/i18n/utils";
import { NextRequest, NextResponse } from "next/server";

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
