'use server';

import { createClient } from '@/lib/supabase/server';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag } from 'next/cache';
import {
  CreateQuickTransactionPayload,
  createQuickTransactionSchema,
  executeQuickTransactionSchema,
  ExecuteQuickTransactionPayload,
  MAX_QUICK_TRANSACTIONS,
  updateQuickTransactionSchema,
  UpdateQuickTransactionPayload,
} from './schemas';
import {
  getQuickTransactionsCount,
  getQuickTransactionById,
  insertQuickTransaction,
  updateQuickTransaction,
  deleteQuickTransaction,
} from './queries';
import {
  getExchangeRateForCurrency,
  getPrimaryCurrencyCode,
  insertTransaction,
} from '@/features/transactions/queries';
import { logger } from '@/lib/logger';

export async function createQuickTransactionAction(
  payload: CreateQuickTransactionPayload
): Promise<ActionResponse> {
  return executeValidatedAction(createQuickTransactionSchema, payload, async (user, data) => {
    const supabase = await createClient();

    // Check count constraint
    const currentCount = await getQuickTransactionsCount(supabase, user.id);
    if (currentCount >= MAX_QUICK_TRANSACTIONS) {
      logger.warn('Quick transactions limit exceeded', { userId: user.id, currentCount });
      return {
        success: false,
        message: `Maximum ${MAX_QUICK_TRANSACTIONS} quick transactions allowed`,
      };
    }

    // Verify wallet exists and belongs to user
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, is_active')
      .eq('id', data.wallet_id)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet || !wallet.is_active) {
      logger.warn('Invalid or inactive wallet for quick transaction', {
        userId: user.id,
        walletId: data.wallet_id,
      });
      return { success: false, message: 'Selected wallet is invalid or inactive' };
    }

    const created = await insertQuickTransaction(supabase, user.id, data);

    logger.info('Quick transaction created successfully', {
      userId: user.id,
      quickTransactionId: created.id,
      name: created.name,
    });

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    updateTag(`quick-transactions-${user.id}`);

    return {
      success: true,
      message: 'Quick transaction template created successfully',
      data: created,
    };
  });
}

export async function updateQuickTransactionAction(
  payload: UpdateQuickTransactionPayload
): Promise<ActionResponse> {
  return executeValidatedAction(updateQuickTransactionSchema, payload, async (user, data) => {
    const supabase = await createClient();

    const existing = await getQuickTransactionById(supabase, user.id, data.id);
    if (!existing) {
      return { success: false, message: 'Quick transaction not found' };
    }

    const updated = await updateQuickTransaction(supabase, user.id, data.id, data);

    logger.info('Quick transaction updated successfully', {
      userId: user.id,
      quickTransactionId: data.id,
    });

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    updateTag(`quick-transactions-${user.id}`);

    return {
      success: true,
      message: 'Quick transaction template updated successfully',
      data: updated,
    };
  });
}

export async function deleteQuickTransactionAction(id: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabase = await createClient();

    await deleteQuickTransaction(supabase, user.id, id);

    logger.info('Quick transaction deleted successfully', {
      userId: user.id,
      quickTransactionId: id,
    });

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    updateTag(`quick-transactions-${user.id}`);

    return {
      success: true,
      message: 'Quick transaction template deleted successfully',
    };
  });
}

export async function executeQuickTransactionAction(
  payload: ExecuteQuickTransactionPayload
): Promise<ActionResponse<{ transaction_id: string; template_name: string; amount: number }>> {
  return executeValidatedAction(executeQuickTransactionSchema, payload, async (user, data) => {
    const supabase = await createClient();

    // Fetch quick transaction
    const template = await getQuickTransactionById(supabase, user.id, data.id);
    if (!template) {
      logger.warn('Quick transaction template not found for execution', {
        userId: user.id,
        quickTransactionId: data.id,
      });
      return { success: false, message: 'Quick transaction template not found' };
    }

    // Verify wallet
    if (!template.wallet || !template.wallet.is_active) {
      logger.warn('Wallet associated with quick transaction is inactive or not found', {
        userId: user.id,
        walletId: template.wallet_id,
      });
      return { success: false, message: 'Associated wallet is inactive or unavailable' };
    }

    // Primary currency
    const primaryCurrency = await getPrimaryCurrencyCode(supabase, user.id);
    if (!primaryCurrency) {
      return { success: false, message: 'Primary currency not configured' };
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const numericAmount = Number(template.amount);
    const finalAmount = template.type === 'income' ? numericAmount : -numericAmount;

    let crossRate = 1.0;
    if (template.currency_code !== primaryCurrency) {
      const primaryRateToEUR = await getExchangeRateForCurrency(supabase, primaryCurrency, currentDate);
      const txRateToEUR = await getExchangeRateForCurrency(supabase, template.currency_code, currentDate);

      if (!primaryRateToEUR || !txRateToEUR) {
        return {
          success: false,
          message: 'Exchange rates not available for current date and currencies',
        };
      }

      crossRate = primaryRateToEUR / txRateToEUR;
    }

    const normalizedAmount = finalAmount * crossRate;

    const txPayload = {
      amount: String(template.amount),
      type: template.type as 'expense' | 'income',
      currency_code: template.currency_code,
      wallet_id: template.wallet_id,
      date: currentDate,
      category_id: template.category_id || undefined,
      description: template.description || template.name,
    };

    const inserted = await insertTransaction(
      supabase,
      user.id,
      txPayload,
      finalAmount,
      normalizedAmount,
      crossRate
    );

    logger.info('One-Tap quick transaction executed successfully', {
      userId: user.id,
      quickTransactionId: template.id,
      transactionId: inserted.transaction_id,
      amount: finalAmount,
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets');

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return {
      success: true,
      message: 'Transaction executed successfully',
      data: {
        transaction_id: inserted.transaction_id,
        template_name: template.name,
        amount: finalAmount,
      },
    };
  });
}
