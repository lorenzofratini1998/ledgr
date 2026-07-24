'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { formatZodErrors } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CreateTagPayload, createTagSchema } from './schemas';
import { insertTag, updateTag, deleteTag, bulkDeleteTags } from './queries';

export async function createTagAction(payload: CreateTagPayload): Promise<ActionResponse<any>> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = createTagSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid tag data',
        errors: formatZodErrors(result.error)
      };
    }

    const supabaseServer = await createClient();
    const newTag = await insertTag(supabaseServer, user.id, result.data);

    revalidatePath('/tags');
    // Using revalidatePath('/transactions') instead since tag cache is tricky
    revalidatePath('/transactions');

    return { success: true, message: 'Tag created successfully', data: newTag };
  } catch (error: any) {
    console.error('Failed to create tag:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while creating the tag' };
  }
}

export async function updateTagAction(id: string, payload: CreateTagPayload): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = createTagSchema.safeParse(payload);
    if (!result.success) {
      return {
        success: false,
        message: 'Invalid tag data',
        errors: formatZodErrors(result.error)
      };
    }

    const supabaseServer = await createClient();
    await updateTag(supabaseServer, id, user.id, result.data);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    revalidateTag(`tags-${user.id}`, undefined as any);
    revalidateTag(`transactions-${user.id}`, undefined as any);

    return { success: true, message: 'Tag updated successfully' };
  } catch (error: any) {
    console.error('Failed to update tag:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while updating the tag' };
  }
}

export async function deleteTagAction(id: string): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const supabaseServer = await createClient();
    await deleteTag(supabaseServer, id, user.id);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    revalidateTag(`tags-${user.id}`, undefined as any);
    revalidateTag(`transactions-${user.id}`, undefined as any);

    return { success: true, message: 'Tag deleted successfully' };
  } catch (error: any) {
    console.error('Failed to delete tag:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the tag' };
  }
}

export async function bulkDeleteTagsAction(ids: string[]): Promise<ActionResponse> {
  try {
    const { data: { user } } = await getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    if (!ids.length) {
      return { success: false, message: 'No tags selected' };
    }

    const supabaseServer = await createClient();
    await bulkDeleteTags(supabaseServer, ids, user.id);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    revalidateTag(`tags-${user.id}`, undefined as any);
    revalidateTag(`transactions-${user.id}`, undefined as any);

    return { success: true, message: `${ids.length} tags deleted successfully` };
  } catch (error: any) {
    console.error('Failed to delete tags:', error);
    return { success: false, message: 'An unexpected error occurred while deleting the tags' };
  }
}
