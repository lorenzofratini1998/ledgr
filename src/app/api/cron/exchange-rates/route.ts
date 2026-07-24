import { NextResponse } from "next/server";
import { syncExchangeRates } from "@/features/exchange-rates/services";
import { getLastExchangeRateDate } from "@/features/exchange-rates/queries";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lastRecordDate = await getLastExchangeRateDate(supabaseAdmin);

    let startDate = "2024-01-01";
    if (lastRecordDate) {
      startDate = lastRecordDate;
    } else {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      startDate = d.toISOString().split("T")[0];
    }

    const result = await syncExchangeRates(supabaseAdmin, startDate);

    return NextResponse.json(result);

  } catch (error: any) {
    logger.error(error, "Unexpected error in exchange rates cron");
    return new NextResponse(
      JSON.stringify({ error: error.message || "Internal Server Error", stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
