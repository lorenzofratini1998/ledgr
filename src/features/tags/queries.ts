import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";
import { CreateTagPayload } from "./schemas";

export async function getTags(
  userId: string,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }
) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchTags = unstable_cache(
    async (uid: string, page: number, pageSize: number, search?: string) => {
      const supabase = createStaticClient(token);

      const offset = (page - 1) * pageSize;

      let query = supabase
        .from("tags")
        .select("*", { count: "exact" })
        .eq("user_id", uid)
        .eq("is_active", true);

      if (search) {
        query = query.ilike("tag_name", `%${search}%`);
      }

      const { data, error, count } = await query
        .order("tag_name", { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      return { data: data || [], count: count || 0 };
    },
    [`tags-${userId}`, params?.page?.toString() || '1', params?.search || ''],
    { tags: [`tags-${userId}`], revalidate: 3600 }
  );

  return fetchTags(userId, params?.page || 1, params?.pageSize || 20, params?.search);
}

export async function insertTag(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: CreateTagPayload
) {
  const { data, error } = await supabase
    .from("tags")
    .insert({
      user_id: userId,
      tag_name: payload.tag_name,
      tag_description: payload.tag_description || null,
      color: payload.color || null,
      icon: payload.icon || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error(`A tag with the name "${payload.tag_name}" already exists.`);
    }
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return data;
}

export async function updateTag(
  supabase: SupabaseClient<Database>,
  tagId: string,
  userId: string,
  payload: CreateTagPayload
) {
  const { data, error } = await supabase
    .from("tags")
    .update({
      tag_name: payload.tag_name,
      tag_description: payload.tag_description || null,
      color: payload.color || null,
      icon: payload.icon || null,
    })
    .eq("tag_id", tagId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error(`A tag with the name "${payload.tag_name}" already exists.`);
    }
    throw new Error(`Failed to update tag: ${error.message}`);
  }

  return data;
}

export async function deleteTag(
  supabase: SupabaseClient<Database>,
  tagId: string,
  userId: string
) {
  const { error } = await supabase
    .from("tags")
    .delete()
    .eq("tag_id", tagId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
}

export async function bulkDeleteTags(
  supabase: SupabaseClient<Database>,
  tagIds: string[],
  userId: string
) {
  const { error } = await supabase
    .from("tags")
    .delete()
    .in("tag_id", tagIds)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete tags: ${error.message}`);
  }
}
