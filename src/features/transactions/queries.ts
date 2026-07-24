import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";
import { CreateTransactionPayload } from "./schemas";

export async function getExchangeRateForCurrency(
  supabase: SupabaseClient<Database>,
  currencyCode: string,
  date: string
): Promise<number | null> {
  // Base is always EUR in our exchange_rates table
  // If currency is EUR, the rate is exactly 1
  if (currencyCode === "EUR") return 1.0;

  const { data, error } = await supabase
    .from("exchange_rates")
    .select("rate")
    .eq("quote_currency", currencyCode)
    .lte("date", date)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch exchange rate for ${currencyCode}: ${error.message}`);
  }

  return data.rate;
}

export async function insertTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: CreateTransactionPayload,
  finalAmount: number,
  normalizedAmount: number,
  exchangeRate: number
) {
  // Insert the main transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      wallet_id: payload.wallet_id,
      category_id: payload.category_id || null,
      date: payload.date,
      description: payload.description,
      amount: finalAmount,
      normalized_amount: normalizedAmount,
      exchange_rate: exchangeRate,
      currency_code: payload.currency_code,
    })
    .select("transaction_id")
    .single();

  if (txError) {
    throw new Error(`Failed to insert transaction: ${txError.message}`);
  }

  // Insert tags if any
  if (payload.tags && payload.tags.length > 0) {
    const { error: tagsError } = await supabase.from("transactions_tags").insert(
      payload.tags.map((tagId) => ({
        transaction_id: transaction.transaction_id,
        tag_id: tagId,
        user_id: userId,
      }))
    );

    if (tagsError) {
      throw new Error(`Failed to associate tags: ${tagsError.message}`);
    }
  }

  return transaction;
}

export async function updateTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string,
  payload: CreateTransactionPayload,
  finalAmount: number,
  normalizedAmount: number,
  exchangeRate: number
) {
  const { error: txError } = await supabase
    .from("transactions")
    .update({
      wallet_id: payload.wallet_id,
      category_id: payload.category_id || null,
      date: payload.date,
      description: payload.description,
      amount: finalAmount,
      normalized_amount: normalizedAmount,
      exchange_rate: exchangeRate,
      currency_code: payload.currency_code,
    })
    .eq("transaction_id", transactionId)
    .eq("user_id", userId);

  if (txError) {
    throw new Error(`Failed to update transaction: ${txError.message}`);
  }

  // Handle tags: simple strategy is to delete existing and re-insert
  await supabase
    .from("transactions_tags")
    .delete()
    .eq("transaction_id", transactionId)
    .eq("user_id", userId);

  if (payload.tags && payload.tags.length > 0) {
    const { error: tagsError } = await supabase.from("transactions_tags").insert(
      payload.tags.map((tagId) => ({
        transaction_id: transactionId,
        tag_id: tagId,
        user_id: userId,
      }))
    );

    if (tagsError) {
      throw new Error(`Failed to associate tags: ${tagsError.message}`);
    }
  }
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("transaction_id", transactionId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

export async function bulkDeleteTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionIds: string[]
) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .in("transaction_id", transactionIds)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete transactions: ${error.message}`);
  }
}

export async function getPrimaryCurrencyCode(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("primary_currency_code")
    .eq("profile_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch primary currency: ${error.message}`);
  }

  return data.primary_currency_code;
}

export async function getTransactions(
  userId: string,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    walletIds?: string[];
    categoryIds?: string[];
    tagIds?: string[];
    currencyCodes?: string[];
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    type?: 'income' | 'expense' | 'all';
  }
) {
  const supabaseServer = await createClient();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const token = session?.access_token;

  const fetchTransactions = unstable_cache(
    async () => {
      const supabase = createStaticClient(token);

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const offset = (page - 1) * pageSize;

      let selectStr = `
        *,
        wallets ( name, currency_code, color, icon ),
        categories ( category_name, color, icon )
      `;

      if (params?.tagIds && params.tagIds.length > 0) {
        selectStr += `, transactions_tags!inner ( tag_id, tags ( tag_id, tag_name, color ) )`;
      } else {
        selectStr += `, transactions_tags ( tags ( tag_id, tag_name, color ) )`;
      }

      let query = supabase
        .from("transactions")
        .select(selectStr, { count: "exact" })
        .eq("user_id", userId);

      if (params?.search) {
        query = query.ilike("description", `%${params.search}%`);
      }
      if (params?.walletIds && params.walletIds.length > 0) {
        query = query.in("wallet_id", params.walletIds);
      }
      if (params?.categoryIds && params.categoryIds.length > 0) {
        query = query.in("category_id", params.categoryIds);
      }
      if (params?.tagIds && params.tagIds.length > 0) {
        query = query.in("transactions_tags.tag_id", params.tagIds);
      }
      if (params?.currencyCodes && params.currencyCodes.length > 0) {
        query = query.in("currency_code", params.currencyCodes);
      }
      if (params?.type === 'income') {
        query = query.gt("amount", 0);
      } else if (params?.type === 'expense') {
        query = query.lt("amount", 0);
      }
      if (params?.startDate) {
        query = query.gte("date", params.startDate);
      }
      if (params?.endDate) {
        query = query.lte("date", params.endDate);
      }
      if (params?.minAmount !== undefined) {
        // filter by absolute amount or normalized amount?
        // since amount is positive for income and negative for expense,
        // it's tricky. If they are looking for transactions over 100$, 
        // they might want ABS(amount) >= 100. PostgREST doesn't support ABS() directly in filters easily unless using RPC or computed column.
        // For simplicity, we can use normalized_amount (which is also signed) or just amount.
        // To support simple filters, let's assume they want to filter absolute value. We'd have to do an 'or' filter:
        // amount >= min or amount <= -min.
        query = query.or(`amount.gte.${params.minAmount},amount.lte.-${params.minAmount}`);
      }
      if (params?.maxAmount !== undefined) {
        // Absolute amount <= maxAmount means amount <= maxAmount AND amount >= -maxAmount
        // In postgREST: and(amount.lte.maxAmount,amount.gte.-maxAmount)
        query = query.or(`and(amount.lte.${params.maxAmount},amount.gte.-${params.maxAmount})`);
      }

      const { data, error, count } = await query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return { data: data || [], count: count || 0 };
    },
    [
      `transactions-${userId}`,
      String(params?.page || 1),
      String(params?.pageSize || 20),
      params?.search || "",
      params?.walletIds?.join(",") || "",
      params?.categoryIds?.join(",") || "",
      params?.tagIds?.join(",") || "",
      params?.currencyCodes?.join(",") || "",
      params?.startDate || "",
      params?.endDate || "",
      String(params?.minAmount ?? ""),
      String(params?.maxAmount ?? ""),
      params?.type || "all"
    ],
    { tags: [`transactions-${userId}`] }
  );

  return fetchTransactions();
}

