import { NextRequest, NextResponse } from "next/server";
import { User } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";


const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/auth/callback', '/update-password'];


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

  // Exempt /auth/callback and /update-password from redirecting authenticated users to the dashboard.
  // We need them to be able to exchange codes and reset passwords even if they have an active session.
  if (user && isPublicRoute && path !== '/auth/callback' && path !== '/update-password') {
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
  // Check the JWT claim for zero-latency routing
  if (user.user_metadata?.onboarding_completed === true) {
    return true;
  }

  // Any user without the JWT claim must go through onboarding or relogin
  return false;
}
