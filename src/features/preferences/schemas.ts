import { z } from 'zod';
import { DASHBOARD_PERIODS, THEMES } from '@/lib/constants/core';

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30),
  display_name: z.string().min(2).max(50).nullable(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

export const updateGeneralPreferencesSchema = z.object({
  language_locale: z.string().length(5),
  date_format: z.enum(['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']),
  default_dashboard_range: z.enum(DASHBOARD_PERIODS),
  timezone: z.string().min(1),
});
export type UpdateGeneralPreferencesPayload = z.infer<typeof updateGeneralPreferencesSchema>;

export const updateAppearancePreferencesSchema = z.object({
  theme: z.enum(THEMES),
});
export type UpdateAppearancePreferencesPayload = z.infer<typeof updateAppearancePreferencesSchema>;

export const updateSecurityPreferencesSchema = z.object({
  biometric_lock_enabled: z.boolean(),
  lock_timeout_seconds: z.number().min(0).max(3600),
  notify_budget_breach: z.boolean(),
  notify_recurring_reminder: z.boolean(),
  budget_alert_threshold: z.number().min(10).max(100),
});
export type UpdateSecurityPreferencesPayload = z.infer<typeof updateSecurityPreferencesSchema>;
