'use server';

import { createClient } from '@/lib/supabase/server';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag } from 'next/cache';
import { CreateTransactionPayload, createTransactionSchema } from './schemas';
import { getExchangeRateForCurrency, getPrimaryCurrencyCode, insertTransaction, updateTransaction, deleteTransaction, bulkDeleteTransactions } from './queries';

export async function createTransactionAction(payload: CreateTransactionPayload): Promise<ActionResponse> {
  return executeValidatedAction(createTransactionSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();

    // Determine final amount (positive for income, negative for expense)
    const numericAmount = Number(data.amount);
    const finalAmount = data.type === 'income' ? numericAmount : -numericAmount;

    // Fetch user's primary currency code
    const primaryCurrency = await getPrimaryCurrencyCode(supabaseServer, user.id);
    if (!primaryCurrency) {
      return { success: false, message: 'Primary currency not configured' };
    }

    // Calculate cross exchange rate and normalized amount
    let crossRate = 1.0;

    // If the transaction currency is different from the primary currency, calculate cross rate
    if (data.currency_code !== primaryCurrency) {
      const primaryRateToEUR = await getExchangeRateForCurrency(supabaseServer, primaryCurrency, data.date);
      const txRateToEUR = await getExchangeRateForCurrency(supabaseServer, data.currency_code, data.date);

      if (!primaryRateToEUR || !txRateToEUR) {
        return { success: false, message: 'Exchange rates not available for the selected date and currencies' };
      }

      // Formula: Rate(tx -> primary) = Rate(EUR -> primary) / Rate(EUR -> tx)
      crossRate = primaryRateToEUR / txRateToEUR;
    }

    const normalizedAmount = finalAmount * crossRate;

    // Insert into database
    await insertTransaction(
      supabaseServer,
      user.id,
      data,
      finalAmount,
      normalizedAmount,
      crossRate
    );

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); // Balances change implicitly

    // Invalidate unstable_cache tags
    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction created successfully' };
  });
}

export async function updateTransactionAction(id: string, payload: CreateTransactionPayload): Promise<ActionResponse> {
  return executeValidatedAction(createTransactionSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();

    // Determine final amount (positive for income, negative for expense)
    const numericAmount = Number(data.amount);
    const finalAmount = data.type === 'income' ? numericAmount : -numericAmount;

    // Fetch user's primary currency code
    const primaryCurrency = await getPrimaryCurrencyCode(supabaseServer, user.id);
    if (!primaryCurrency) {
      return { success: false, message: 'Primary currency not configured' };
    }

    // Calculate cross exchange rate and normalized amount
    let crossRate = 1.0;

    if (data.currency_code !== primaryCurrency) {
      const primaryRateToEUR = await getExchangeRateForCurrency(supabaseServer, primaryCurrency, data.date);
      const txRateToEUR = await getExchangeRateForCurrency(supabaseServer, data.currency_code, data.date);

      if (!primaryRateToEUR || !txRateToEUR) {
        return { success: false, message: 'Exchange rates not available for the selected date and currencies' };
      }

      crossRate = primaryRateToEUR / txRateToEUR;
    }

    const normalizedAmount = finalAmount * crossRate;

    await updateTransaction(
      supabaseServer,
      user.id,
      id,
      data,
      finalAmount,
      normalizedAmount,
      crossRate
    );

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction updated successfully' };
  });
}

export async function deleteTransactionAction(id: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabaseServer = await createClient();
    await deleteTransaction(supabaseServer, user.id, id);

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction deleted successfully' };
  });
}

export async function bulkDeleteTransactionsAction(ids: string[]): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabaseServer = await createClient();
    await bulkDeleteTransactions(supabaseServer, user.id, ids);

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: `${ids.length} transactions deleted successfully` };
  });
}

export async function confirmPendingTransactionAction(id: string, exactAmount: number): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabaseServer = await createClient();

    // Fetch the transaction to get details needed for recalculating normalized amount
    const { data: tx, error: fetchError } = await supabaseServer
      .from('transactions')
      .select('amount, currency_code, date, status')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !tx) {
      return { success: false, message: 'Transaction not found' };
    }

    if (tx.status !== 'pending') {
      return { success: false, message: 'Transaction is not pending' };
    }

    // Determine sign based on original amount's sign (since DB amount is negative for expense)
    const finalAmount = tx.amount < 0 ? -Math.abs(exactAmount) : Math.abs(exactAmount);

    const primaryCurrency = await getPrimaryCurrencyCode(supabaseServer, user.id);
    if (!primaryCurrency) {
      return { success: false, message: 'Primary currency not configured' };
    }

    let crossRate = 1.0;
    if (tx.currency_code !== primaryCurrency) {
      const primaryRateToEUR = await getExchangeRateForCurrency(supabaseServer, primaryCurrency, tx.date);
      const txRateToEUR = await getExchangeRateForCurrency(supabaseServer, tx.currency_code, tx.date);

      if (primaryRateToEUR && txRateToEUR) {
        crossRate = primaryRateToEUR / txRateToEUR;
      }
    }

    const normalizedAmount = finalAmount * crossRate;

    const { error: updateError } = await supabaseServer
      .from('transactions')
      .update({
        amount: finalAmount,
        normalized_amount: normalizedAmount,
        exchange_rate: crossRate,
        status: 'completed'
      })
      .eq('transaction_id', id)
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, message: `Failed to confirm transaction: ${updateError.message}` };
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction confirmed successfully' };
  });
}

