'use server';

import { completeOnboarding } from '@/data/user-preferences';
import { EcosystemPayload, ecosystemSchema, OnboardingPayload, onboardingSchema } from '@/features/onboarding/schemas';
import { getLocaleDictionary } from '@/i18n/get-dictionary';
import { createClient, getUser } from '@/lib/supabase/server';
import { formatZodErrors } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { logger } from '@/utils/logger';
import { revalidateTag } from 'next/cache';
import { DEFAULT_ONBOARDING_CATEGORIES, DefaultCategoryKey } from './constants';

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
    const { data: { user }, error: authError } = await getUser();

    if (authError || !user) {
      return { success: false, message: 'Unauthorized' };
    }

    await completeOnboarding(user.id, result.data);

    // Note: We NO LONGER set onboarding_completed to true here.
    // It will be set at the end of the Ecosystem step.
    revalidateTag(`preferences-${user.id}`, 'max');

    return { success: true, message: 'Preferences saved successfully' };
  } catch (error: unknown) {
    logger.error(error, 'Error during basic onboarding', { error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred during onboarding',
    };
  }
}

export async function completeEcosystemOnboarding(data: EcosystemPayload): Promise<ActionResponse> {
  const result = ecosystemSchema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: 'Invalid ecosystem payload',
      errors: formatZodErrors(result.error),
    };
  }

  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await getUser();

    if (authError || !user) {
      return { success: false, message: 'Unauthorized' };
    }

    let hasWarnings = false;

    // Execute bulk insert inside a try/catch so if it fails we still complete onboarding
    try {
      // Load dictionary (we assume English as fallback if needed)
      const { dictionary } = await getLocaleDictionary();

      // 2. Insert Categories
      if (result.data.categories.length > 0) {
        const categoriesToInsert = result.data.categories.map(catKey => {
          const defaultCat = DEFAULT_ONBOARDING_CATEGORIES[catKey as DefaultCategoryKey];
          // Get translated name from dictionary
          const catName = dictionary.onboarding.default_categories[catKey as keyof typeof dictionary.onboarding.default_categories] || catKey;

          return {
            user_id: user.id,
            category_name: catName,
            color: defaultCat?.color || 'slate',
            icon: defaultCat?.icon || 'tag',
            is_active: true
          };
        });

        const { error: catError } = await supabase.from('categories').insert(categoriesToInsert);
        if (catError) throw new Error(`Category insert failed: ${catError.message}`);
      }

      // 3. Insert Wallet
      if (result.data.wallet) {
        const { error: walletError } = await supabase.from('wallets').insert({
          user_id: user.id,
          name: result.data.wallet.name,
          description: result.data.wallet.description,
          type: result.data.wallet.type,
          initial_balance: parseFloat(result.data.wallet.initial_balance),
          currency_code: result.data.wallet.currency_code,
          color: result.data.wallet.color,
          icon: result.data.wallet.icon,
          is_active: true
        });
        if (walletError) throw new Error(`Wallet insert failed: ${walletError.message}`);
      }
    } catch (insertError: any) {
      logger.error(insertError, 'Failed to bulk insert ecosystem data');
      hasWarnings = true;
    }

    // 4. Set onboarding_completed to true
    const { error: updateError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (updateError) {
      throw new Error(`Failed to update user metadata: ${updateError.message}`);
    }

    if (hasWarnings) {
      return { success: true, message: 'Onboarding completed, but some default data could not be created.' };
    }

    return { success: true, message: 'Workspace setup successfully' };

  } catch (error: unknown) {
    logger.error(error, 'Error during ecosystem setup', { error });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
