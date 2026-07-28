import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import { unstable_cache } from 'next/cache';

export async function getCashflowSummary(userId: string, from: string, to: string, walletId?: string, categoryId?: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchCashflow = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      const supabaseClient: any = supabase;
      const { data, error } = await supabaseClient.rpc('get_cashflow_summary', {
        p_user_id: userId,
        p_from: from,
        p_to: to,
        p_wallet_id: walletId || null,
        p_category_id: categoryId || null,
      });

      if (error) throw new Error(`Failed to fetch cashflow: ${error.message}`);
      return data?.[0] || { income: 0, expense: 0, net: 0 };
    },
    [`cashflow-${userId}-${from}-${to}-${walletId || 'all'}-${categoryId || 'all'}`],
    { tags: [`transactions-${userId}`] }
  );

  return fetchCashflow();
}

export async function getBalanceTrend(userId: string, from: string, to: string, walletId?: string, categoryId?: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchTrend = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      const supabaseClient: any = supabase;
      const { data, error } = await supabaseClient.rpc('get_balance_trend', {
        p_user_id: userId,
        p_from: from,
        p_to: to,
        p_wallet_id: walletId || null,
        p_category_id: categoryId || null,
      });

      if (error) throw new Error(`Failed to fetch balance trend: ${error.message}`);
      return data || [];
    },
    [`balance-trend-${userId}-${from}-${to}-${walletId || 'all'}-${categoryId || 'all'}`],
    { tags: [`transactions-${userId}`, `wallets-${userId}`] }
  );

  return fetchTrend();
}

export async function getCategoryBreakdown(userId: string, from: string, to: string, walletId?: string, categoryId?: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchBreakdown = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      const supabaseClient: any = supabase;
      const { data, error } = await supabaseClient.rpc('get_category_breakdown', {
        p_user_id: userId,
        p_from: from,
        p_to: to,
        p_wallet_id: walletId || null,
        p_category_id: categoryId || null,
      });

      if (error) throw new Error(`Failed to fetch category breakdown: ${error.message}`);
      return data || [];
    },
    [`category-breakdown-${userId}-${from}-${to}-${walletId || 'all'}-${categoryId || 'all'}`],
    { tags: [`transactions-${userId}`, `categories-${userId}`] }
  );

  return fetchBreakdown();
}

export async function getMonthlyCashflow(userId: string, from: string, to: string, walletId?: string, categoryId?: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchMonthly = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      
      const supabaseClient: any = supabase;
      const { data, error } = await supabaseClient.rpc('get_monthly_cashflow', {
        p_user_id: userId,
        p_from: from,
        p_to: to,
        p_wallet_id: walletId || null,
        p_category_id: categoryId || null,
      });

      if (error) throw new Error(`Failed to fetch cashflow: ${error.message}`);
      return data || [];
    },
    [`cashflow-${userId}-${from}-${to}-${walletId || 'all'}-${categoryId || 'all'}`],
    { tags: [`transactions-${userId}`] }
  );

  return fetchMonthly();
}

export async function getWalletBalances(userId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchBalances = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      const supabaseClient: any = supabase;
      const { data, error } = await supabaseClient.rpc('get_wallet_balances', {
        p_user_id: userId,
      });

      if (error) throw new Error(`Failed to fetch wallet balances: ${error.message}`);
      return data || [];
    },
    [`wallet-balances-${userId}`],
    { tags: [`transactions-${userId}`, `wallets-${userId}`] }
  );

  return fetchBalances();
}

export async function getRecentTransactions(userId: string, limit: number = 5, walletId?: string, categoryId?: string, recurringId?: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchRecent = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          wallets (name, icon, color),
          categories (category_name, icon, color)
        `)
        .eq('user_id', userId);

      if (walletId) {
        query = query.eq('wallet_id', walletId);
      }
      
      if (categoryId) {
        // Fetch child categories
        const { data: children } = await supabase.from('categories').select('category_id').eq('parent_id', categoryId);
        const categoryIds = [categoryId];
        if (children) {
          children.forEach((c: any) => categoryIds.push(c.category_id));
        }
        
        query = query.in('category_id', categoryIds);
      }

      if (recurringId) {
        query = query.eq('recurring_id', recurringId);
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new Error(`Failed to fetch recent transactions: ${error.message}`);
      return data || [];
    },
    [`recent-transactions-${userId}-${limit}-${walletId || 'all'}-${categoryId || 'all'}-${recurringId || 'all'}`],
    { tags: [`transactions-${userId}`] }
  );

  return fetchRecent();
}
