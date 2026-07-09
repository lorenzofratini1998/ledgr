import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback'];
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  if (!user && !isPublicRoute) {
    // Redirect unauthenticated users to login if they try to access a protected route.
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute && path !== '/auth/callback') {
    // Redirect authenticated users away from auth pages to the main application.
    // We explicitly exclude /auth/callback because during the PKCE flow, 
    // the user session is established in the callback itself.
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
