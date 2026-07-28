'use server';

import {
  createBudget as dbCreateBudget,
  updateBudget as dbUpdateBudget,
  deleteBudget as dbDeleteBudget,
} from '@/features/budgets/queries';
import { createBudgetSchema, CreateBudgetInput, updateBudgetSchema, UpdateBudgetInput } from '@/features/budgets/schemas';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { updateTag } from 'next/cache';
import { z } from 'zod';

export async function createBudgetAction(payload: CreateBudgetInput): Promise<ActionResponse> {
  return executeValidatedAction(createBudgetSchema, payload, async (user, data) => {
    await dbCreateBudget(data, user.id);
    updateTag(`budgets-${user.id}`);
    return { success: true };
  });
}

export async function updateBudgetAction(payload: UpdateBudgetInput): Promise<ActionResponse> {
  return executeValidatedAction(updateBudgetSchema, payload, async (user, data) => {
    await dbUpdateBudget(data, user.id);
    updateTag(`budgets-${user.id}`);
    return { success: true };
  });
}

const deleteBudgetSchema = z.object({
  budgetId: z.string().uuid(),
});

export async function deleteBudgetAction(budgetId: string): Promise<ActionResponse> {
  return executeValidatedAction(deleteBudgetSchema, { budgetId }, async (user, data) => {
    await dbDeleteBudget(data.budgetId, user.id);
    updateTag(`budgets-${user.id}`);
    return { success: true };
  });
}
