import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";
import { CreateTransactionPayload } from "./schemas";
import { logger } from "@/lib/logger";

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
    logger.error(error as Error, `Failed to fetch exchange rate for ${currencyCode}`);
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
      transfer_id: payload.transfer_id || null,
    })
    .select("transaction_id")
    .single();

  if (txError) {
    logger.error(txError as Error, "Failed to insert transaction into DB", { userId, payload });
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
      logger.error(tagsError as Error, "Failed to associate tags to transaction", { transactionId: transaction.transaction_id });
      throw new Error(`Failed to associate tags: ${tagsError.message}`);
    }
  }

  return transaction;
}

export async function insertTransfer(
  supabase: SupabaseClient<Database>,
  userId: string,
  payload: CreateTransactionPayload,
  transferId: string,
  sourceDetails: {
    amount: number;
    normalizedAmount: number;
    exchangeRate: number;
    currencyCode: string;
  },
  destDetails: {
    walletId: string;
    amount: number;
    normalizedAmount: number;
    exchangeRate: number;
    currencyCode: string;
  },
  feeDetails?: {
    amount: number;
    normalizedAmount: number;
    exchangeRate: number;
    currencyCode: string;
  }
) {
  // 1. Source transaction (negative amount)
  const sourcePayload: Database["public"]["Tables"]["transactions"]["Insert"] = {
    user_id: userId,
    wallet_id: payload.wallet_id,
    category_id: null,
    date: payload.date,
    description: payload.description,
    amount: -Math.abs(sourceDetails.amount),
    normalized_amount: -Math.abs(sourceDetails.normalizedAmount),
    exchange_rate: sourceDetails.exchangeRate,
    currency_code: sourceDetails.currencyCode,
    transfer_id: transferId,
  };

  // 2. Destination transaction (positive amount)
  const destPayload: Database["public"]["Tables"]["transactions"]["Insert"] = {
    user_id: userId,
    wallet_id: destDetails.walletId,
    category_id: null,
    date: payload.date,
    description: payload.description,
    amount: Math.abs(destDetails.amount),
    normalized_amount: Math.abs(destDetails.normalizedAmount),
    exchange_rate: destDetails.exchangeRate,
    currency_code: destDetails.currencyCode,
    transfer_id: transferId,
  };

  const recordsToInsert: Database["public"]["Tables"]["transactions"]["Insert"][] = [sourcePayload, destPayload];

  // 3. Optional fee transaction
  if (feeDetails && feeDetails.amount > 0) {
    recordsToInsert.push({
      user_id: userId,
      wallet_id: payload.wallet_id,
      category_id: null,
      date: payload.date,
      description: `${payload.description} (Fee)`,
      amount: -Math.abs(feeDetails.amount),
      normalized_amount: -Math.abs(feeDetails.normalizedAmount),
      exchange_rate: feeDetails.exchangeRate,
      currency_code: feeDetails.currencyCode,
      transfer_id: transferId,
    });
  }

  const { data: insertedTxs, error: insertError } = await supabase
    .from("transactions")
    .insert(recordsToInsert)
    .select("transaction_id");

  if (insertError) {
    logger.error(insertError as Error, "Failed to insert transfer transactions into DB", { userId, transferId });
    throw new Error(`Failed to execute transfer: ${insertError.message}`);
  }

  // Insert tags if any for source transaction
  if (payload.tags && payload.tags.length > 0 && insertedTxs && insertedTxs.length > 0) {
    const tagInserts = insertedTxs.flatMap((tx) =>
      (payload.tags || []).map((tagId) => ({
        transaction_id: tx.transaction_id,
        tag_id: tagId,
        user_id: userId,
      }))
    );

    const { error: tagsError } = await supabase.from("transactions_tags").insert(tagInserts);
    if (tagsError) {
      logger.error(tagsError as Error, "Failed to associate tags to transfer", { transferId });
    }
  }

  return { transferId, transactions: insertedTxs };
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
      transfer_id: payload.transfer_id || null,
    })
    .eq("transaction_id", transactionId)
    .eq("user_id", userId);

  if (txError) {
    logger.error(txError as Error, "Failed to update transaction in DB", { userId, transactionId });
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
      logger.error(tagsError as Error, "Failed to associate tags during transaction update", { transactionId });
      throw new Error(`Failed to associate tags: ${tagsError.message}`);
    }
  }
}

export async function deleteTransaction(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionId: string
) {
  // Check if this transaction is part of a transfer
  const { data: tx, error: fetchError } = await supabase
    .from("transactions")
    .select("transfer_id")
    .eq("transaction_id", transactionId)
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    logger.error(fetchError as Error, "Failed to check transfer status for delete", { transactionId });
  }

  if (tx?.transfer_id) {
    // Delete both linked transactions
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("transfer_id", tx.transfer_id)
      .eq("user_id", userId);

    if (error) {
      logger.error(error as Error, "Failed to delete linked transfer transactions", { transferId: tx.transfer_id });
      throw new Error(`Failed to delete transfer: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("transaction_id", transactionId)
    .eq("user_id", userId);

  if (error) {
    logger.error(error as Error, "Failed to delete transaction", { transactionId });
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

export async function getTransferDetails(
  supabase: SupabaseClient<Database>,
  userId: string,
  transferId: string
) {
  const { data: txs, error } = await supabase
    .from("transactions")
    .select(`
      *,
      transactions_tags ( tag_id, tags ( tag_id, tag_name, color ) )
    `)
    .eq("transfer_id", transferId)
    .eq("user_id", userId);

  if (error || !txs || txs.length === 0) {
    logger.warn("Transfer transactions not found", { userId, transferId });
    return null;
  }

  const destTx = txs.find((t) => t.amount > 0);
  const feeTx = txs.find(
    (t) => t.amount < 0 && (t.description?.includes("(Fee)") || (txs.length === 3 && t.transaction_id !== destTx?.transaction_id))
  );
  const sourceTx =
    txs.find((t) => t.amount < 0 && t.transaction_id !== feeTx?.transaction_id) ||
    txs.find((t) => t.amount < 0);

  if (!sourceTx || !destTx) {
    return null;
  }

  const baseDescription = sourceTx.description || destTx.description || "";

  return {
    transaction_id: sourceTx.transaction_id,
    transfer_id: transferId,
    type: "transfer" as const,
    wallet_id: sourceTx.wallet_id,
    destination_wallet_id: destTx.wallet_id,
    amount: Math.abs(Number(sourceTx.amount)).toFixed(2),
    destination_amount:
      Math.abs(Number(destTx.amount)) !== Math.abs(Number(sourceTx.amount))
        ? Math.abs(Number(destTx.amount)).toFixed(2)
        : "",
    currency_code: sourceTx.currency_code,
    fee: feeTx ? Math.abs(Number(feeTx.amount)).toFixed(2) : "",
    date: sourceTx.date,
    description: baseDescription,
    tags: sourceTx.transactions_tags?.map((tt: any) => tt.tag_id || tt.tags?.tag_id).filter(Boolean) || [],
  };
}

export async function bulkDeleteTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  transactionIds: string[]
) {
  // Fetch any transfer_ids associated with these transactionIds
  const { data: txsWithTransfer } = await supabase
    .from("transactions")
    .select("transfer_id")
    .in("transaction_id", transactionIds)
    .eq("user_id", userId)
    .not("transfer_id", "is", null);

  const transferIds = Array.from(
    new Set((txsWithTransfer || []).map((t) => t.transfer_id).filter(Boolean))
  ) as string[];

  // Delete matching transactions by ID
  const { error: idDeleteError } = await supabase
    .from("transactions")
    .delete()
    .in("transaction_id", transactionIds)
    .eq("user_id", userId);

  if (idDeleteError) {
    logger.error(idDeleteError as Error, "Failed to bulk delete transactions by ID", { transactionIds });
    throw new Error(`Failed to delete transactions: ${idDeleteError.message}`);
  }

  // Also delete remaining counterpart transactions from any identified transfers
  if (transferIds.length > 0) {
    const { error: transferDeleteError } = await supabase
      .from("transactions")
      .delete()
      .in("transfer_id", transferIds)
      .eq("user_id", userId);

    if (transferDeleteError) {
      logger.error(transferDeleteError as Error, "Failed to bulk delete counterpart transfer transactions", { transferIds });
    }
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
    logger.error(error as Error, "Failed to fetch primary currency code", { userId });
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
    type?: "income" | "expense" | "transfer" | "all";
    recurringId?: string;
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
        const { data: children } = await supabase.from('categories').select('category_id').in('parent_id', params.categoryIds);
        const resolvedCategoryIds = [...params.categoryIds];
        if (children) {
          children.forEach((c: any) => resolvedCategoryIds.push(c.category_id));
        }
        query = query.in("category_id", resolvedCategoryIds);
      }
      if (params?.tagIds && params.tagIds.length > 0) {
        query = query.in("transactions_tags.tag_id", params.tagIds);
      }
      if (params?.currencyCodes && params.currencyCodes.length > 0) {
        query = query.in("currency_code", params.currencyCodes);
      }
      if (params?.recurringId) {
        query = query.eq("recurring_id", params.recurringId);
      }
      if (params?.type === "income") {
        query = query.gt("amount", 0).is("transfer_id", null);
      } else if (params?.type === "expense") {
        query = query.lt("amount", 0).is("transfer_id", null);
      } else if (params?.type === "transfer") {
        query = query.not("transfer_id", "is", null);
      }
      if (params?.startDate) {
        query = query.gte("date", params.startDate);
      }
      if (params?.endDate) {
        query = query.lte("date", params.endDate);
      }
      if (params?.minAmount !== undefined) {
        query = query.or(`amount.gte.${params.minAmount},amount.lte.-${params.minAmount}`);
      }
      if (params?.maxAmount !== undefined) {
        query = query.or(`and(amount.lte.${params.maxAmount},amount.gte.-${params.maxAmount})`);
      }

      const { data, error, count } = await query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        logger.error(error as Error, "Failed to fetch transactions from DB", { userId, params });
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
      params?.type || "all",
    ],
    { tags: [`transactions-${userId}`] }
  );

  return fetchTransactions();
}


