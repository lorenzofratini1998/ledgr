'use server';

import { completeOnboarding } from '@/features/preferences/queries';
import { EcosystemPayload, ecosystemSchema, OnboardingPayload, onboardingSchema } from '@/features/onboarding/schemas';
import { getLocaleDictionary } from '@/i18n/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import { executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { logger } from '@/lib/utils/logger';
import { updateTag } from 'next/cache';
import { DEFAULT_ONBOARDING_CATEGORIES, DefaultCategoryKey } from './constants';

export async function completeBasicOnboarding(data: OnboardingPayload): Promise<ActionResponse> {
  return executeValidatedAction(onboardingSchema, data, async (user, payload) => {
    const supabase = await createClient();
    await completeOnboarding(supabase, user.id, payload);
    updateTag(`preferences-${user.id}`);
    return { success: true, message: 'Preferences saved successfully' };
  });
}

export async function completeEcosystemOnboarding(data: EcosystemPayload): Promise<ActionResponse> {
  return executeValidatedAction(ecosystemSchema, data, async (user, payload) => {
    const supabase = await createClient();
    let hasWarnings = false;

    try {
      const { dictionary } = await getLocaleDictionary();

      let categoriesToInsert: any[] = [];
      if (payload.categories.length > 0) {
        categoriesToInsert = payload.categories.map(catKey => {
          const defaultCat = DEFAULT_ONBOARDING_CATEGORIES[catKey as DefaultCategoryKey];
          const catName = dictionary.onboarding.default_categories[catKey as keyof typeof dictionary.onboarding.default_categories] || catKey;

          return {
            user_id: user.id,
            category_name: catName,
            color: defaultCat?.color || 'slate',
            icon: defaultCat?.icon || 'tag',
            is_active: true
          };
        });
      }

      let walletToInsert = null;
      if (payload.wallet) {
        walletToInsert = {
          user_id: user.id,
          name: payload.wallet.name,
          description: payload.wallet.description,
          type: payload.wallet.type,
          initial_balance: parseFloat(payload.wallet.initial_balance),
          currency_code: payload.wallet.currency_code,
          color: payload.wallet.color,
          icon: payload.wallet.icon,
          is_active: true
        };
      }

      // Execute insert
      await import('./queries').then(m => m.insertEcosystemData(categoriesToInsert, walletToInsert));
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
  });
}
