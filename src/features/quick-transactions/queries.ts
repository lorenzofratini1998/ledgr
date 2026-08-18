import { CreateQuickTransactionPayload } from './schemas';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { QuickTransactionWithDetails } from '@/types/models';
import { unstable_cache } from 'next/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

export async function getQuickTransactions(userId: string): Promise<QuickTransactionWithDetails[]> {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchQuickTransactions = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data, error } = await supabase
        .from('quick_transactions')
        .select(`
          *,
          wallet:wallets(*),
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        logger.error(error as Error, 'Failed to fetch quick transactions', { userId });
        throw new Error(`Failed to fetch quick transactions: ${error.message}`);
      }

      return (data || []) as QuickTransactionWithDetails[];
    },
    [`quick-transactions-${userId}`],
    { tags: [`quick-transactions-${userId}`] }
  );

  return fetchQuickTransactions();
}

export async function getQuickTransactionsCount(supabase: SupabaseClient<Database>, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('quick_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    logger.error(error as Error, 'Failed to get quick transactions count', { userId });
    throw error;
  }

  return count || 0;
}

export async function getQuickTransactionById(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
): Promise<QuickTransactionWithDetails | null> {
  const { data, error } = await supabase
    .from('quick_transactions')
    .select(`
      *,
      wallet:wallets(*),
      category:categories(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    logger.error(error as Error, 'Failed to fetch quick transaction by id', { userId, id });
    throw error;
  }

  return data as QuickTransactionWithDetails;
}

export async function insertQuickTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: CreateQuickTransactionPayload
) {
  const numericAmount = Number(payload.amount);
  const { data, error } = await supabase
    .from('quick_transactions')
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      wallet_id: payload.wallet_id,
      category_id: payload.category_id || null,
      amount: numericAmount,
      currency_code: payload.currency_code,
      type: payload.type,
      description: payload.description ? payload.description.trim() : payload.name.trim(),
      icon: payload.icon || null,
      color: payload.color || null,
      display_order: payload.display_order ?? 0,
    })
    .select('*')
    .single();

  if (error) {
    logger.error(error as Error, 'Failed to insert quick transaction', { userId, payload });
    throw error;
  }

  return data;
}

export async function updateQuickTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  payload: Partial<CreateQuickTransactionPayload>
) {
  const updateData: Database['public']['Tables']['quick_transactions']['Update'] = {};

  if (payload.name !== undefined) updateData.name = payload.name.trim();
  if (payload.wallet_id !== undefined) updateData.wallet_id = payload.wallet_id;
  if (payload.category_id !== undefined) updateData.category_id = payload.category_id || null;
  if (payload.amount !== undefined) updateData.amount = Number(payload.amount);
  if (payload.currency_code !== undefined) updateData.currency_code = payload.currency_code;
  if (payload.type !== undefined) updateData.type = payload.type;
  if (payload.description !== undefined) updateData.description = payload.description ? payload.description.trim() : null;
  if (payload.icon !== undefined) updateData.icon = payload.icon || null;
  if (payload.color !== undefined) updateData.color = payload.color || null;
  if (payload.display_order !== undefined) updateData.display_order = payload.display_order;

  const { data, error } = await supabase
    .from('quick_transactions')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    logger.error(error as Error, 'Failed to update quick transaction', { userId, id, payload });
    throw error;
  }

  return data;
}

export async function deleteQuickTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string
) {
  const { error } = await supabase
    .from('quick_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    logger.error(error as Error, 'Failed to delete quick transaction', { userId, id });
    throw error;
  }
}
