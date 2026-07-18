import { applyLocalization } from "@/lib/middleware/localization";
import { applyCorrelationId } from "@/lib/middleware/observability";
import { enforceRoutingGuards } from "@/lib/middleware/routing-guard";
import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabaseResponse: response, user } = await updateSession(request);

  applyCorrelationId(request, response);

  const redirectResponse = await enforceRoutingGuards(request, response, user);
  if (redirectResponse) return redirectResponse;

  await applyLocalization(request, response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\..*|icon-.*\\.(?:png|jpg|jpeg)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
