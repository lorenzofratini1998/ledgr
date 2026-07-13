'use server';

import { onboardingSchema, OnboardingPayload } from '@/lib/schemas/onboarding.schema';
import { completeOnboarding } from '@/data/user-preferences';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/utils/logger';
import { cookies } from 'next/headers';
import { ActionResponse } from '@/types/actions';
import { formatZodErrors } from '@/lib/utils/action-utils';

export async function completeBasicOnboarding(data: OnboardingPayload): Promise<ActionResponse> {
  // Validate payload
  const result = onboardingSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: 'Invalid onboarding payload',
      errors: formatZodErrors(result.error),
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: 'Unauthorized' };
    }

    await completeOnboarding(user.id, result.data);

    // Set secure cookie so middleware doesn't need to query the DB anymore
    const cookieStore = await cookies();
    cookieStore.set('ONBOARDING_COMPLETED', user.id, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { success: true, message: 'Onboarding completed successfully' };
  } catch (error: unknown) {
    logger.error(error, 'Error during onboarding', { error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during onboarding',
    };
  }
}
