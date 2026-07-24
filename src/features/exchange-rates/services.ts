import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { FrankfurterRate } from "./types";
import { FRANKFURTER_API_BASE_URL, DEFAULT_BASE_CURRENCY } from "./constants";
import { getSupportedCurrencies, upsertExchangeRates } from "./queries";

export async function syncExchangeRates(
  supabaseAdmin: SupabaseClient<Database>,
  startDate: string,
  endDate?: string
): Promise<{ inserted: number; message: string }> {
  const urlParams = new URLSearchParams({
    base: DEFAULT_BASE_CURRENCY,
    from: startDate,
  });

  if (endDate) {
    urlParams.append("to", endDate);
  }

  const apiUrl = `${FRANKFURTER_API_BASE_URL}/rates?${urlParams.toString()}`;
  console.log(`[SyncService] Fetching from: ${apiUrl}`);

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Frankfurter API error: ${response.status} ${response.statusText}`);
  }

  const rates: FrankfurterRate[] = await response.json();

  if (!Array.isArray(rates) || rates.length === 0) {
    return { inserted: 0, message: "No new rates available" };
  }

  const supportedCurrenciesList = await getSupportedCurrencies(supabaseAdmin);
  const validCurrencies = new Set(supportedCurrenciesList);

  const validRates = rates.filter(
    (r) => validCurrencies.has(r.base) && validCurrencies.has(r.quote)
  );

  console.log(
    `[SyncService] Filtered ${rates.length} rates down to ${validRates.length} valid rates.`
  );

  if (validRates.length === 0) {
    return { inserted: 0, message: "No valid rates to insert after filtering" };
  }

  await upsertExchangeRates(supabaseAdmin, validRates);

  return { inserted: validRates.length, message: "Sync successful" };
}
