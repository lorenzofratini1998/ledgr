import { CreateWalletPayload, UpdateWalletPayload } from '@/features/wallets/schemas';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { unstable_cache } from 'next/cache';

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

      // Fetch dynamic balances
      const supabaseClient: any = supabase;
      const { data: balancesData } = await supabaseClient.rpc('get_wallet_balances', {
        p_user_id: userId,
      });

      const walletsWithBalances = wallets?.map(wallet => {
        const b = balancesData?.find((bd: any) => bd.wallet_id === wallet.id);
        return {
          ...wallet,
          balance: b ? b.balance : wallet.initial_balance
        };
      });

      return walletsWithBalances || [];
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
    exclude_from_net_worth: data.exclude_from_net_worth,
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

      // Fetch dynamic balances
      const supabaseClient: any = supabase;
      const { data: balancesData } = await supabaseClient.rpc('get_wallet_balances', {
        p_user_id: userId,
        p_is_active: false,
      });

      const walletsWithBalances = wallets?.map(wallet => {
        const b = balancesData?.find((bd: any) => bd.wallet_id === wallet.id);
        return {
          ...wallet,
          balance: b ? b.balance : wallet.initial_balance
        };
      });

      return walletsWithBalances || [];
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

  // Enforce Hard Delete according to AC-3
  // TODO: Implement transaction cascade and transfer conversion (Story 2 AC-4 & AC-5)
  // When transactions are implemented, this deletion will need to trigger conversions first.
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete wallet: ${error.message}`);
  }
}

export async function updateWallet(userId: string, walletId: string, data: UpdateWalletPayload) {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.color !== undefined) updateData.color = data.color || null;
  if (data.icon !== undefined) updateData.icon = data.icon || null;
  if (data.exclude_from_net_worth !== undefined) updateData.exclude_from_net_worth = data.exclude_from_net_worth;
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
