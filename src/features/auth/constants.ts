type AuthProvider = { id: string };
import { logger } from "@/lib/logger";

export async function getActiveAuthProviders(): Promise<string[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/auth_providers?select=id&is_enabled=eq.true`;

    const res = await fetch(url, {
      cache: 'force-cache',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch auth providers: ${res.statusText}`);
    }

    const providers = await res.json() as AuthProvider[];
    return providers.map((p) => p.id) || [];
  } catch (error) {
    logger.error(error, "Error fetching auth providers");
    return [];
  }
}
