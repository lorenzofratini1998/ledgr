import { createClient } from '@/lib/supabase/server';
import { OnboardingPayload } from '@/lib/schemas/onboarding.schema';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export async function completeOnboarding(
  userId: string,
  payload: OnboardingPayload
) {
  const supabase = await createClient();

  // Fetch the profile_id for this user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
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
      onboarding_completed: true,
    })
    .eq('profile_id', profile.id);

  if (updateError) {
    throw new Error(`Failed to update preferences: ${updateError.message}`);
  }
}

export async function hasUserCompletedOnboarding(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return false;

  const { data: pref } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('profile_id', profile.id)
    .single();

  return !!pref?.onboarding_completed;
}

export async function getUserPreferences(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  const { data: pref } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('profile_id', profile.id)
    .single();

  return pref;
}
