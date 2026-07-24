import { OnboardingPayload } from '@/features/onboarding/schemas';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { Database } from '@/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

export async function completeOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: OnboardingPayload
) {
  // Fetch the profile_id for this user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found for the given user');
  }

  // Update user_preferences
  const { error: updateError } = await supabase
    .from('user_preferences')
    .update({
      theme: payload.theme,
      date_format: payload.date_format,
      language_locale: payload.language_locale,
      primary_currency_code: payload.primary_currency_code,
    })
    .eq('profile_id', profile.id);

  if (updateError) {
    throw new Error(`Failed to update preferences: ${updateError.message}`);
  }
}

export async function getUserPreferences(userId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchPrefs = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profile) return null;

      const { data: pref } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      return pref;
    },
    [`preferences-${userId}`],
    { tags: [`preferences-${userId}`] }
  );

  return fetchPrefs();
}
