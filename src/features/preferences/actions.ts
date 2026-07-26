'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, updateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_OPTIONS } from '@/i18n/utils';
import {
  UpdateProfilePayload,
  updateProfileSchema,
  UpdateGeneralPreferencesPayload,
  updateGeneralPreferencesSchema,
  UpdateAppearancePreferencesPayload,
  updateAppearancePreferencesSchema,
  UpdateSecurityPreferencesPayload,
  updateSecurityPreferencesSchema
} from './schemas';

export async function updateProfile(payload: UpdateProfilePayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('Unauthorized attempt to update profile');
    throw new Error('Unauthorized');
  }

  const parsed = updateProfileSchema.parse(payload);

  const { error } = await supabase
    .from('profiles')
    .update({
      username: parsed.username,
      display_name: parsed.display_name,
    })
    .eq('id', user.id);

  if (error) {
    logger.error(error, 'Failed to update profile in Supabase', { userId: user.id });
    throw new Error(error.message);
  }

  logger.info('Profile updated successfully', { userId: user.id, fields: Object.keys(parsed) });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  updateTag(`profile-${user.id}`);
  return { success: true };
}

export async function updateGeneralPreferences(payload: UpdateGeneralPreferencesPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('Unauthorized attempt to update general preferences');
    throw new Error('Unauthorized');
  }

  const parsed = updateGeneralPreferencesSchema.parse(payload);

  const { error } = await supabase
    .from('user_preferences')
    .update({
      language_locale: parsed.language_locale,
      date_format: parsed.date_format,
      default_dashboard_range: parsed.default_dashboard_range,
    })
    .eq('profile_id', user.id);

  if (error) {
    logger.error(error, 'Failed to update general preferences in Supabase', { userId: user.id });
    throw new Error(error.message);
  }

  logger.info('General preferences updated successfully', { userId: user.id, locale: parsed.language_locale });

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, parsed.language_locale, LOCALE_COOKIE_OPTIONS);

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  updateTag(`preferences-${user.id}`);
  return { success: true };
}

export async function updateAppearancePreferences(payload: UpdateAppearancePreferencesPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('Unauthorized attempt to update appearance preferences');
    throw new Error('Unauthorized');
  }

  const parsed = updateAppearancePreferencesSchema.parse(payload);

  const { error } = await supabase
    .from('user_preferences')
    .update({
      theme: parsed.theme,
    })
    .eq('profile_id', user.id);

  if (error) {
    logger.error(error, 'Failed to update appearance preferences in Supabase', { userId: user.id });
    throw new Error(error.message);
  }

  logger.info('Appearance preferences updated successfully', { userId: user.id, theme: parsed.theme });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  updateTag(`preferences-${user.id}`);
  return { success: true };
}

export async function updateSecurityPreferences(payload: UpdateSecurityPreferencesPayload) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('Unauthorized attempt to update security preferences');
    throw new Error('Unauthorized');
  }

  const parsed = updateSecurityPreferencesSchema.parse(payload);

  const { error } = await supabase
    .from('user_preferences')
    .update({
      biometric_lock_enabled: parsed.biometric_lock_enabled,
      lock_timeout_seconds: parsed.lock_timeout_seconds,
      notify_budget_breach: parsed.notify_budget_breach,
      notify_recurring_reminder: parsed.notify_recurring_reminder,
      budget_alert_threshold: parsed.budget_alert_threshold,
    })
    .eq('profile_id', user.id);

  if (error) {
    logger.error(error, 'Failed to update security preferences in Supabase', { userId: user.id });
    throw new Error(error.message);
  }

  logger.info('Security preferences updated successfully', { userId: user.id });

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  updateTag(`preferences-${user.id}`);
  return { success: true };
}

export async function deleteUserAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    logger.warn('Unauthorized attempt to delete user account');
    throw new Error('Unauthorized');
  }

  logger.info('Initiating account deletion', { userId: user.id });

  // Delete user via admin client to trigger ON DELETE CASCADE on all related tables
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (error) {
    logger.error(error, 'Failed to delete user account via Supabase Admin', { userId: user.id });
    throw new Error(`Failed to delete account: ${error.message}`);
  }
  
  logger.info('User account permanently deleted', { userId: user.id });
  
  // Sign out the user locally to destroy the session
  await supabase.auth.signOut();
  
  return { success: true };
}
