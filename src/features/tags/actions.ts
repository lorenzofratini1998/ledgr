'use server';

import { createClient } from '@/lib/supabase/server';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag as updateCacheTag } from 'next/cache';
import { CreateTagPayload, createTagSchema } from './schemas';
import { insertTag, updateTag, deleteTag, bulkDeleteTags } from './queries';

export async function createTagAction(payload: CreateTagPayload): Promise<ActionResponse<any>> {
  return executeValidatedAction(createTagSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();
    const newTag = await insertTag(supabaseServer, user.id, data);

    revalidatePath('/tags');
    // Using revalidatePath('/transactions') instead since tag cache is tricky
    revalidatePath('/transactions');

    return { success: true, message: 'Tag created successfully', data: newTag };
  });
}

export async function updateTagAction(id: string, payload: CreateTagPayload): Promise<ActionResponse> {
  return executeValidatedAction(createTagSchema, payload, async (user, data) => {
    const supabaseServer = await createClient();
    await updateTag(supabaseServer, id, user.id, data);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    updateCacheTag(`tags-${user.id}`);
    updateCacheTag(`transactions-${user.id}`);

    return { success: true, message: 'Tag updated successfully' };
  });
}

export async function deleteTagAction(id: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabaseServer = await createClient();
    await deleteTag(supabaseServer, id, user.id);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    updateCacheTag(`tags-${user.id}`);
    updateCacheTag(`transactions-${user.id}`);

    return { success: true, message: 'Tag deleted successfully' };
  });
}

export async function bulkDeleteTagsAction(ids: string[]): Promise<ActionResponse> {
  return executeAction(async (user) => {
    if (!ids.length) {
      return { success: false, message: 'No tags selected' };
    }

    const supabaseServer = await createClient();
    await bulkDeleteTags(supabaseServer, ids, user.id);

    revalidatePath('/tags');
    revalidatePath('/transactions');
    
    updateCacheTag(`tags-${user.id}`);
    updateCacheTag(`transactions-${user.id}`);

    return { success: true, message: `${ids.length} tags deleted successfully` };
  });
}
