import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import { FrankfurterRate } from "./types";

export async function getLastExchangeRateDate(
  supabase: SupabaseClient<Database>
): Promise<string | null> {
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // Ignore "No rows returned"
    throw new Error(`DAL: Failed to fetch last exchange rate date: ${error.message}`);
  }

  return data?.date || null;
}

export async function getSupportedCurrencies(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data, error } = await supabase
    .from("currencies")
    .select("iso_code");

  if (error) {
    throw new Error(`DAL: Failed to fetch currencies: ${error.message}`);
  }

  return data.map((c) => c.iso_code);
}

export async function upsertExchangeRates(
  supabase: SupabaseClient<Database>,
  rates: FrankfurterRate[]
): Promise<void> {
  const chunkSize = 2000;
  
  for (let i = 0; i < rates.length; i += chunkSize) {
    const chunk = rates.slice(i, i + chunkSize);
    
    const { error } = await supabase
      .from("exchange_rates")
      .upsert(
        chunk.map((r) => ({
          date: r.date,
          base_currency: r.base,
          quote_currency: r.quote,
          rate: r.rate,
        })),
        { 
          onConflict: "date,base_currency,quote_currency",
          ignoreDuplicates: true 
        }
      );

    if (error) {
      throw new Error(`DAL: Failed to insert exchange rates chunk: ${error.message}`);
    }
  }
}
