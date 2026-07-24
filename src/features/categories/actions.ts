'use server';

import {
  archiveCategory as dbArchiveCategory,
  createCategory as dbCreateCategory,
  deleteCategory as dbDeleteCategory,
  unarchiveCategory as dbUnarchiveCategory,
  updateCategory as dbUpdateCategory
} from '@/features/categories/queries';
import { CreateCategoryPayload, CreateCategorySchema } from '@/features/categories/schemas';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { updateTag } from 'next/cache';

export async function createCategoryAction(payload: CreateCategoryPayload): Promise<ActionResponse> {
  return executeValidatedAction(CreateCategorySchema, payload, async (user, data) => {
    await dbCreateCategory(data, user.id);
    updateTag(`categories-${user.id}`);
    return { success: true };
  });
}

export async function archiveCategoryAction(categoryId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await dbArchiveCategory(categoryId);
    updateTag(`categories-${user.id}`);
    return { success: true };
  });
}

export async function deleteCategoryAction(categoryId: string, forceCascade: boolean = false): Promise<ActionResponse> {
  return executeAction(async (user) => {
    try {
      await dbDeleteCategory(categoryId, forceCascade);
      updateTag(`categories-${user.id}`);
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'HAS_CHILDREN') {
        return { success: false, message: 'HAS_CHILDREN' };
      }
      throw error; // Let the executeAction catch handle the rest
    }
  });
}

export async function updateCategoryAction(categoryId: string, payload: CreateCategoryPayload): Promise<ActionResponse> {
  return executeValidatedAction(CreateCategorySchema, payload, async (user, data) => {
    await dbUpdateCategory(categoryId, data, user.id);
    updateTag(`categories-${user.id}`);
    return { success: true };
  });
}

export async function unarchiveCategoryAction(categoryId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await dbUnarchiveCategory(categoryId);
    updateTag(`categories-${user.id}`);
    return { success: true };
  });
}
