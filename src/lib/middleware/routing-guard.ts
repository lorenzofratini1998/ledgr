import { NextRequest, NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { hasUserCompletedOnboarding } from "@/data/user-preferences";

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/auth/callback'];
const ONBOARDING_COOKIE_NAME = 'ONBOARDING_COMPLETED';

export async function enforceRoutingGuards(
  request: NextRequest,
  response: NextResponse,
  user: User | null,
  supabase: SupabaseClient<Database>
): Promise<NextResponse | null> {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  if (path.startsWith('/api')) {
    return null; // No redirect required
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  if (!user && !isPublicRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute && path !== '/auth/callback') {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (!user || isPublicRoute) return null;

  const isOnboarded = await resolveOnboardingStatus(request, response, user, supabase);

  if (path === '/onboarding') {
    if (isOnboarded) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return null;
  }

  if (!isOnboarded) {
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  return null; // No redirect required
}

async function resolveOnboardingStatus(
  request: NextRequest,
  response: NextResponse,
  user: User,
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  const onboardingCookie = request.cookies.get(ONBOARDING_COOKIE_NAME);
  if (onboardingCookie?.value === 'true') {
    return true;
  }

  const onboarded = await hasUserCompletedOnboarding(supabase, user.id);
  if (onboarded) {
    response.cookies.set(ONBOARDING_COOKIE_NAME, 'true', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
  return onboarded;
}
