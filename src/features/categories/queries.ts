import { CreateCategoryPayload } from '@/features/categories/schemas';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { CategoryWithChildren } from '@/types/models';
import { unstable_cache } from 'next/cache';

export async function getCategories(userId: string): Promise<CategoryWithChildren[]> {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchCategories = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      // Fetch all active categories for this user
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Build the hierarchical structure
      const categoryMap = new Map<string, CategoryWithChildren>();
      const rootCategories: CategoryWithChildren[] = [];

      // Initialize all categories in the map
      (categories || []).forEach((cat) => {
        categoryMap.set(cat.category_id, { ...cat, children: [] });
      });

      // Nest children under parents
      categoryMap.forEach((cat) => {
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(cat);
          }
        } else {
          rootCategories.push(cat);
        }
      });

      return rootCategories;
    },
    [`categories-${userId}`],
    { tags: [`categories-${userId}`] }
  );

  return fetchCategories();
}

export async function createCategory(payload: CreateCategoryPayload, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      category_name: payload.category_name,
      category_description: payload.category_description || null,
      parent_id: payload.parent_id || null,
      color: payload.color || null,
      icon: payload.icon || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

export async function updateCategory(categoryId: string, payload: CreateCategoryPayload, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .update({
      category_name: payload.category_name,
      category_description: payload.category_description || null,
      parent_id: payload.parent_id || null,
      color: payload.color || null,
      icon: payload.icon || null,
      updated_at: new Date().toISOString(),
    })
    .eq('category_id', categoryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
}

export async function archiveCategory(categoryId: string) {
  const supabase = await createClient();

  // First archive children
  const { error: childrenError } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('parent_id', categoryId);

  if (childrenError) {
    throw new Error(`Failed to archive subcategories: ${childrenError.message}`);
  }

  // Then archive parent
  const { data, error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('category_id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to archive category: ${error.message}`);
  }

  return data;
}

export async function unarchiveCategory(categoryId: string) {
  const supabase = await createClient();

  // Reactivate parent
  const { data, error } = await supabase
    .from('categories')
    .update({ is_active: true })
    .eq('category_id', categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unarchive category: ${error.message}`);
  }

  // Also reactivate children
  const { error: childrenError } = await supabase
    .from('categories')
    .update({ is_active: true })
    .eq('parent_id', categoryId);

  if (childrenError) {
    console.error(`Failed to unarchive subcategories: ${childrenError.message}`);
  }

  return data;
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  // Enforce Soft Deletes according to the Ledger Pattern
  const { error: childrenError } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('parent_id', categoryId);

  if (childrenError) {
    throw new Error(`Failed to soft-delete subcategories: ${childrenError.message}`);
  }

  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('category_id', categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }

  return true;
}
