'use server';

import {
  archiveCategory as dbArchiveCategory,
  createCategory as dbCreateCategory,
  deleteCategory as dbDeleteCategory,
  unarchiveCategory as dbUnarchiveCategory,
  updateCategory as dbUpdateCategory
} from '@/features/categories/queries';
import { CreateCategoryPayload, CreateCategorySchema } from '@/features/categories/schemas';
import { formatZodErrors } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidateTag } from 'next/cache';

import { createClient, getUser } from '@/lib/supabase/server';

export async function createCategoryAction(payload: CreateCategoryPayload): Promise<ActionResponse> {
  try {
    const validatedData = CreateCategorySchema.safeParse(payload);
    
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(validatedData.error)
      };
    }

    const supabase = await createClient();
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbCreateCategory(validatedData.data, user.id);
    revalidateTag(`categories-${user.id}`, undefined as any);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while creating the category.'
    };
  }
}

export async function archiveCategoryAction(categoryId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbArchiveCategory(categoryId);
    revalidateTag(`categories-${user.id}`, undefined as any);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error archiving category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while archiving the category.'
    };
  }
}

export async function deleteCategoryAction(categoryId: string, forceCascade: boolean = false): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbDeleteCategory(categoryId, forceCascade);
    revalidateTag(`categories-${user.id}`, undefined as any);
    
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'HAS_CHILDREN') {
      return { success: false, message: 'HAS_CHILDREN' };
    }
    console.error('Error deleting category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the category.'
    };
  }
}

export async function updateCategoryAction(categoryId: string, payload: CreateCategoryPayload): Promise<ActionResponse> {
  try {
    const validatedData = CreateCategorySchema.safeParse(payload);
    
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(validatedData.error)
      };
    }

    const supabase = await createClient();
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbUpdateCategory(categoryId, validatedData.data, user.id);
    revalidateTag(`categories-${user.id}`, undefined as any);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while updating the category.'
    };
  }
}

export async function unarchiveCategoryAction(categoryId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbUnarchiveCategory(categoryId);
    revalidateTag(`categories-${user.id}`, undefined as any);
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error unarchiving category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred while unarchiving the category.'
    };
  }
}
