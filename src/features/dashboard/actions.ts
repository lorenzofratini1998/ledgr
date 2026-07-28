'use server';

import { updateTag } from 'next/cache';

import { getBalanceTrend, getCashflowSummary, getCategoryBreakdown, getMonthlyCashflow, getWalletBalances, getRecentTransactions } from './queries';
import { executeAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { logger } from '@/lib/logger';

export async function fetchCashflowAction(from: string, to: string, walletId?: string, categoryId?: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching cashflow summary', { userId: user.id, from, to, walletId, categoryId });
    const data = await getCashflowSummary(user.id, from, to, walletId, categoryId);
    return { success: true, data };
  });
}

export async function fetchBalanceTrendAction(from: string, to: string, walletId?: string, categoryId?: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching balance trend', { userId: user.id, from, to, walletId, categoryId });
    const data = await getBalanceTrend(user.id, from, to, walletId, categoryId);
    return { success: true, data };
  });
}

export async function fetchCategoryBreakdownAction(from: string, to: string, walletId?: string, categoryId?: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching category breakdown', { userId: user.id, from, to, walletId, categoryId });
    const data = await getCategoryBreakdown(user.id, from, to, walletId, categoryId);
    return { success: true, data };
  });
}

export async function fetchMonthlyCashflowAction(from: string, to: string, walletId?: string, categoryId?: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching monthly cashflow', { userId: user.id, from, to, walletId, categoryId });
    const data = await getMonthlyCashflow(user.id, from, to, walletId, categoryId);
    return { success: true, data };
  });
}

export async function fetchWalletBalancesAction(): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching wallet balances', { userId: user.id });
    const data = await getWalletBalances(user.id);
    return { success: true, data };
  });
}

export async function fetchRecentTransactionsAction(limit: number = 5, walletId?: string, categoryId?: string, recurringId?: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching recent transactions', { userId: user.id, limit, walletId, categoryId, recurringId });
    const data = await getRecentTransactions(user.id, limit, walletId, categoryId, recurringId);
    return { success: true, data };
  });
}

export async function invalidateDashboardCacheAction(): Promise<ActionResponse<void>> {
  return executeAction(async (user) => {
    logger.info('Invalidating dashboard cache from realtime subscriber', { userId: user.id });
    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);
    return { success: true };
  });
}
