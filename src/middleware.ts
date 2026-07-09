import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { resolveLocale } from "@/utils/locale";
import { getActiveLanguages } from "@/data/languages";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // 1. Generate Correlation ID
  const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();

  // 2. Expose it in the response (useful for client-side logging or API clients)
  response.headers.set("x-correlation-id", correlationId);

  // 3. Propagate it to Server Components, Route Handlers, and Server Actions
  // This injects the header into the request object downstream
  response.headers.set("x-middleware-request-x-correlation-id", correlationId);

  // If the auth guard returned a redirect, execute it immediately
  // and skip the remaining locale logic.
  if (response.status === 307 || response.status === 308 || response.headers.get('Location')) {
    return response;
  }

  const { activeLocales, defaultLocale } = await getActiveLanguages();

  const acceptLanguage = request.headers.get("accept-language");
  const locale = resolveLocale(acceptLanguage, activeLocales, defaultLocale);

  // Handle Locale Cookie
  const existingCookie = request.cookies.get('LOCALE');

  if (!existingCookie || existingCookie.value !== locale) {
    response.cookies.set('LOCALE', locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sw.js, manifest.webmanifest (PWA files)
     * - icon-* (PWA icons)
     * - .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ (images)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\..*|icon-.*\\.(?:png|jpg|jpeg)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
