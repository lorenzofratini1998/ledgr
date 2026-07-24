'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { formatZodErrors } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CreateTransactionPayload, createTransactionSchema } from './schemas';
import { getExchangeRateForCurrency, getPrimaryCurrencyCode, insertTransaction, updateTransaction, deleteTransaction, bulkDeleteTransactions, getTransactions } from './queries';

export async function createTransactionAction(payload: CreateTransactionPayload): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = createTransactionSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid transaction data',
        errors: formatZodErrors(result.error)
      };
    }

    const data = result.data;
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
    revalidateTag(`transactions-${user.id}`, undefined as any);
    revalidateTag(`wallets-${user.id}`, undefined as any);

    return { success: true, message: 'Transaction created successfully' };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { success: false, message: 'An unexpected error occurred while creating the transaction' };
  }
}

export async function updateTransactionAction(id: string, payload: CreateTransactionPayload): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = createTransactionSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid transaction data',
        errors: formatZodErrors(result.error)
      };
    }

    const data = result.data;
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

    revalidateTag(`transactions-${user.id}`, undefined as any);
    revalidateTag(`wallets-${user.id}`, undefined as any);

    return { success: true, message: 'Transaction updated successfully' };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return { success: false, message: 'An unexpected error occurred while updating the transaction' };
  }
}

export async function deleteTransactionAction(id: string): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const supabaseServer = await createClient();
    await deleteTransaction(supabaseServer, user.id, id);

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    revalidateTag(`transactions-${user.id}`, undefined as any);
    revalidateTag(`wallets-${user.id}`, undefined as any);

    return { success: true, message: 'Transaction deleted successfully' };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the transaction' };
  }
}

export async function bulkDeleteTransactionsAction(ids: string[]): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const supabaseServer = await createClient();
    await bulkDeleteTransactions(supabaseServer, user.id, ids);

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets'); 

    revalidateTag(`transactions-${user.id}`, undefined as any);
    revalidateTag(`wallets-${user.id}`, undefined as any);

    return { success: true, message: `${ids.length} transactions deleted successfully` };
  } catch (error) {
    console.error('Failed to bulk delete transactions:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the transactions' };
  }
}

