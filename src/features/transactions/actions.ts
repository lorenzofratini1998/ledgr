'use server';

import { createClient } from '@/lib/supabase/server';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag } from 'next/cache';
import { CreateTransactionPayload, createTransactionSchema } from './schemas';
import {
  getExchangeRateForCurrency,
  getPrimaryCurrencyCode,
  insertTransaction,
  insertTransfer,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  getTransferDetails,
} from './queries';
import { logger } from '@/lib/logger';

export async function createTransactionAction(payload: CreateTransactionPayload): Promise<ActionResponse> {
  return executeValidatedAction(createTransactionSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();

    // Fetch user's primary currency code
    const primaryCurrency = await getPrimaryCurrencyCode(supabaseServer, user.id);
    if (!primaryCurrency) {
      logger.warn('Primary currency not configured during transaction creation', { userId: user.id });
      return { success: false, message: 'Primary currency not configured' };
    }

    if (data.type === 'transfer') {
      if (!data.destination_wallet_id) {
        return { success: false, message: 'Destination wallet is required for transfers' };
      }

      // Fetch destination wallet to get its currency code
      const { data: destWallet, error: destWalletError } = await supabaseServer
        .from('wallets')
        .select('currency_code')
        .eq('id', data.destination_wallet_id)
        .eq('user_id', user.id)
        .single();

      if (destWalletError || !destWallet) {
        logger.error(destWalletError as Error, 'Failed to fetch destination wallet for transfer', {
          userId: user.id,
          destWalletId: data.destination_wallet_id,
        });
        return { success: false, message: 'Destination wallet not found' };
      }

      const sourceAmount = Number(data.amount);
      const destAmount = data.destination_amount ? Number(data.destination_amount) : sourceAmount;

      // Calculate cross exchange rate for source
      let sourceCrossRate = 1.0;
      if (data.currency_code !== primaryCurrency) {
        const primaryRateToEUR = await getExchangeRateForCurrency(supabaseServer, primaryCurrency, data.date);
        const sourceRateToEUR = await getExchangeRateForCurrency(supabaseServer, data.currency_code, data.date);

        if (!primaryRateToEUR || !sourceRateToEUR) {
          return { success: false, message: 'Exchange rates not available for the selected date and source currency' };
        }
        sourceCrossRate = primaryRateToEUR / sourceRateToEUR;
      }
      const sourceNormalized = sourceAmount * sourceCrossRate;

      // Calculate cross exchange rate for destination
      let destCrossRate = 1.0;
      if (destWallet.currency_code !== primaryCurrency) {
        const primaryRateToEUR = await getExchangeRateForCurrency(supabaseServer, primaryCurrency, data.date);
        const destRateToEUR = await getExchangeRateForCurrency(supabaseServer, destWallet.currency_code, data.date);

        if (!primaryRateToEUR || !destRateToEUR) {
          return { success: false, message: 'Exchange rates not available for the selected date and destination currency' };
        }
        destCrossRate = primaryRateToEUR / destRateToEUR;
      }
      const destNormalized = destAmount * destCrossRate;

      // Calculate fee if provided
      let feeDetails;
      if (data.fee && Number(data.fee) > 0) {
        const feeAmount = Number(data.fee);
        feeDetails = {
          amount: feeAmount,
          normalizedAmount: feeAmount * sourceCrossRate,
          exchangeRate: sourceCrossRate,
          currencyCode: data.currency_code,
        };
      }

      const transferId = crypto.randomUUID();

      await insertTransfer(
        supabaseServer,
        user.id,
        data,
        transferId,
        {
          amount: sourceAmount,
          normalizedAmount: sourceNormalized,
          exchangeRate: sourceCrossRate,
          currencyCode: data.currency_code,
        },
        {
          walletId: data.destination_wallet_id,
          amount: destAmount,
          normalizedAmount: destNormalized,
          exchangeRate: destCrossRate,
          currencyCode: destWallet.currency_code,
        },
        feeDetails
      );

      logger.info('Transfer created successfully', {
        userId: user.id,
        transferId,
        sourceWalletId: data.wallet_id,
        destWalletId: data.destination_wallet_id,
        amount: sourceAmount,
      });

      revalidatePath('/transactions');
      revalidatePath('/dashboard');
      revalidatePath('/wallets');

      updateTag(`transactions-${user.id}`);
      updateTag(`wallets-${user.id}`);

      return { success: true, message: 'Transfer executed successfully' };
    }

    // Standard income / expense
    const numericAmount = Number(data.amount);
    const finalAmount = data.type === 'income' ? numericAmount : -numericAmount;

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

    await insertTransaction(
      supabaseServer,
      user.id,
      data,
      finalAmount,
      normalizedAmount,
      crossRate
    );

    logger.info('Transaction created successfully', {
      userId: user.id,
      type: data.type,
      walletId: data.wallet_id,
      amount: finalAmount,
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets');

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction created successfully' };
  });
}

export async function updateTransactionAction(id: string, payload: CreateTransactionPayload): Promise<ActionResponse> {
  return executeValidatedAction(createTransactionSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();

    // Check if the transaction is part of a transfer
    const { data: existingTx } = await supabaseServer
      .from('transactions')
      .select('transfer_id')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingTx?.transfer_id || data.type === 'transfer') {
      // If it was already a transfer or is changing to transfer, delete previous linked records and recreate
      if (existingTx?.transfer_id) {
        await supabaseServer
          .from('transactions')
          .delete()
          .eq('transfer_id', existingTx.transfer_id)
          .eq('user_id', user.id);
      } else {
        await supabaseServer
          .from('transactions')
          .delete()
          .eq('transaction_id', id)
          .eq('user_id', user.id);
      }

      // Recreate using create logic
      return await createTransactionAction(data);
    }

    // Standard update
    const numericAmount = Number(data.amount);
    const finalAmount = data.type === 'income' ? numericAmount : -numericAmount;

    const primaryCurrency = await getPrimaryCurrencyCode(supabaseServer, user.id);
    if (!primaryCurrency) {
      return { success: false, message: 'Primary currency not configured' };
    }

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

    logger.info('Transaction updated successfully', { userId: user.id, transactionId: id });

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

    logger.info('Transaction deleted successfully', { userId: user.id, transactionId: id });

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

    logger.info('Bulk deleted transactions', { userId: user.id, count: ids.length });

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

    const { data: tx, error: fetchError } = await supabaseServer
      .from('transactions')
      .select('amount, currency_code, date, status')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !tx) {
      logger.warn('Transaction not found during confirmation', { userId: user.id, transactionId: id });
      return { success: false, message: 'Transaction not found' };
    }

    if (tx.status !== 'pending') {
      return { success: false, message: 'Transaction is not pending' };
    }

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
        status: 'completed',
      })
      .eq('transaction_id', id)
      .eq('user_id', user.id);

    if (updateError) {
      logger.error(updateError as Error, 'Failed to confirm pending transaction', { userId: user.id, transactionId: id });
      return { success: false, message: `Failed to confirm transaction: ${updateError.message}` };
    }

    logger.info('Confirmed pending transaction', { userId: user.id, transactionId: id, exactAmount });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/wallets');

    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);

    return { success: true, message: 'Transaction confirmed successfully' };
  });
}

export async function getTransferDetailsAction(transferId: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    const supabaseServer = await createClient();
    const details = await getTransferDetails(supabaseServer, user.id, transferId);
    if (!details) {
      return { success: false, message: 'Transfer not found' };
    }
    return { success: true, data: details };
  });
}



