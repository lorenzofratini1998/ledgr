'use server';

import { onboardingSchema, OnboardingPayload } from '@/features/onboarding/schemas';
import { completeOnboarding } from '@/data/user-preferences';
import { createClient, getUser } from '@/lib/supabase/server';
import { logger } from '@/utils/logger';

import { revalidateTag } from 'next/cache';
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
    const { data: { user }, error: authError } = await getUser();

    if (authError || !user) {
      return { success: false, message: 'Unauthorized' };
    }

    await completeOnboarding(user.id, result.data);

    // Update the user's JWT metadata so middleware doesn't need to query the DB anymore
    const { error: updateError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (updateError) {
      logger.error(updateError, 'Failed to update user metadata for onboarding');
      // We still consider it a success for the user, but we logged the error.
    }

    revalidateTag(`preferences-${user.id}`, undefined as any);

    return { success: true, message: 'Onboarding completed successfully' };
  } catch (error: unknown) {
    logger.error(error, 'Error during onboarding', { error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during onboarding',
    };
  }
}
