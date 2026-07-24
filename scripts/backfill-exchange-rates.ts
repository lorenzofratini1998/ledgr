import { supabaseAdmin } from "../src/lib/supabase/admin";
import { syncExchangeRates } from "../src/features/exchange-rates/services";

async function backfillYear(year: number) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  try {
    const { inserted, message } = await syncExchangeRates(supabaseAdmin, startDate, endDate);
    console.log(`Completed year ${year}. Inserted ${inserted} records. (${message})`);
  } catch (error) {
    console.error(`Failed to backfill year ${year}:`, error);
  }
}

async function main() {
  console.log("Starting Historical Exchange Rates Backfill...");
  console.log("This script uses ignoreDuplicates: true, so it is safe to re-run.");

  const argYear = process.argv[2];
  const envYear = process.env.BACKFILL_START_YEAR;
  const startYear = parseInt(argYear || envYear || "2020", 10);

  if (isNaN(startYear)) {
    console.error(`Invalid start year provided: ${argYear || envYear}`);
    process.exit(1);
  }

  const currentYear = new Date().getFullYear();
  for (let year = startYear; year <= currentYear; year++) {
    await backfillYear(year);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("All historical backfills completed!");
}

main().catch(console.error);
