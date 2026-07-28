import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";

export async function getRecurringPayments(
  userId: string,
  params?: {
    page?: number;
    pageSize?: number;
    status?: "active" | "paused" | "completed";
  }
) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchRecurring = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let query = supabase
        .from("recurring_payments")
        .select(`
          *,
          wallets ( name, currency_code, color, icon ),
          categories ( category_name, color, icon )
        `, { count: "exact" })
        .eq("user_id", userId);

      if (params?.status) {
        query = query.eq("status", params.status);
      }

      const { data, error, count } = await query
        .order("next_execution_date", { ascending: true })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw new Error(`Failed to fetch recurring payments: ${error.message}`);
      }

      return { data: data || [], count: count || 0 };
    },
    [
      `recurring-${userId}`,
      String(params?.page || 1),
      String(params?.pageSize || 20),
      params?.status || "all"
    ],
    { tags: [`recurring-${userId}`] }
  );

  return fetchRecurring();
}

export async function getRecurringPaymentById(id: string, userId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchPayment = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data, error } = await supabase
        .from("recurring_payments")
        .select(`
          *,
          wallets ( name, currency_code, color, icon ),
          categories ( category_name, color, icon )
        `)
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch recurring payment: ${error.message}`);
      }

      return data;
    },
    [`recurring-${userId}-${id}`],
    { tags: [`recurring-${userId}`] }
  );

  return fetchPayment();
}

export async function getRecurringHistory(userId: string, recurringId: string) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchHistory = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const { data, error } = await supabase
        .from('transactions')
        .select('date, amount, normalized_amount, currency_code')
        .eq('user_id', userId)
        .eq('recurring_id', recurringId)
        .order('date', { ascending: true });

      if (error) throw new Error(`Failed to fetch recurring history: ${error.message}`);
      return data || [];
    },
    [`recurring-history-${userId}-${recurringId}`],
    { tags: [`transactions-${userId}`] }
  );

  return fetchHistory();
}
