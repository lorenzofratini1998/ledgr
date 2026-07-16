import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Creates a standard Supabase client for use inside Next.js unstable_cache.
 * This client DOES NOT read cookies and is explicitly for caching static or 
 * parameterized data where RLS is bypassed or manually filtered by parameters.
 */
export const createStaticClient = (accessToken?: string) => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken ? {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    } : undefined
  );
};
