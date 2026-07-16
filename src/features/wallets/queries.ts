import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { unstable_cache } from 'next/cache';
import { CreateWalletPayload } from '@/features/wallets/schemas';

export async function getWallets(userId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchWallets = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data: wallets, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch wallets: ${error.message}`);
      }

      return wallets || [];
    },
    [`wallets-${userId}`],
    { tags: [`wallets-${userId}`] }
  );

  return fetchWallets();
}

export async function createWallet(userId: string, data: CreateWalletPayload) {
  const supabase = await createClient();

  const { error } = await supabase.from('wallets').insert({
    user_id: userId,
    name: data.name,
    type: data.type,
    initial_balance: Number(data.initial_balance),
    currency_code: data.currency_code,
    description: data.description || null,
    color: data.color || null,
    icon: data.icon || null,
  });

  if (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

export async function archiveWallet(userId: string, walletId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wallets')
    .update({ is_active: false })
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to archive wallet: ${error.message}`);
  }
}

export async function setDefaultWallet(userId: string, walletId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wallets')
    .update({ is_default: true })
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to set default wallet: ${error.message}`);
  }
}

export async function getArchivedWallets(userId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchArchived = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data: wallets, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', false)
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch archived wallets: ${error.message}`);
      }

      return wallets || [];
    },
    [`archived-wallets-${userId}`],
    { tags: [`archived-wallets-${userId}`] }
  );

  return fetchArchived();
}

export async function unarchiveWallet(userId: string, walletId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('wallets')
    .update({ is_active: true })
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to unarchive wallet: ${error.message}`);
  }
}

export async function deleteWallet(userId: string, walletId: string) {
  const supabase = await createClient();

  // Enforce Soft Deletes according to the Ledger Pattern
  const { error } = await supabase
    .from('wallets')
    .update({ is_active: false })
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete wallet: ${error.message}`);
  }
}

export async function updateWallet(userId: string, walletId: string, data: Partial<CreateWalletPayload>) {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.currency_code !== undefined) updateData.currency_code = data.currency_code;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.color !== undefined) updateData.color = data.color || null;
  if (data.icon !== undefined) updateData.icon = data.icon || null;
  // We explicitly do not update initial_balance here as it's part of the ledger history, 
  // but if we needed to, we could add it. Assuming we can update it if the user wants.
  if (data.initial_balance !== undefined) updateData.initial_balance = Number(data.initial_balance);

  const { error } = await supabase
    .from('wallets')
    .update(updateData)
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update wallet: ${error.message}`);
  }
}
