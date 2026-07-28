"use server";

import { createClient } from "@/lib/supabase/server";
import { updateTag } from "next/cache";
import { CreateRecurringPaymentPayload, createRecurringPaymentSchema, UpdateRecurringPaymentPayload, updateRecurringPaymentSchema, UpdateRecurringPaymentStatusPayload, updateRecurringPaymentStatusSchema } from "./schemas";
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { getRecurringHistory } from './queries';
import { logger } from '@/lib/logger';

export async function createRecurringPayment(payload: CreateRecurringPaymentPayload): Promise<ActionResponse> {
  return executeValidatedAction(createRecurringPaymentSchema, payload, async (user, data) => {
    const supabase = await createClient();

    let finalAmount = Number(data.amount);
    if (data.transaction_type === "expense") {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }

    const { data: insertedData, error } = await supabase
      .from("recurring_payments")
      .insert({
        user_id: user.id,
        wallet_id: data.wallet_id,
        category_id: data.category_id || null,
        description: data.description,
        amount: finalAmount,
        currency_code: data.currency_code,
        type: data.type,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date || null,
        next_execution_date: data.start_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    updateTag(`recurring-${user.id}`);
    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);
    
    return { success: true, message: 'Scheduled payment created successfully', data: insertedData };
  });
}

export async function updateRecurringPayment(payload: UpdateRecurringPaymentPayload): Promise<ActionResponse> {
  return executeValidatedAction(updateRecurringPaymentSchema, payload, async (user, data) => {
    const supabase = await createClient();

    let finalAmount = Number(data.amount);
    if (data.transaction_type === "expense") {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }

    // We map start_date to next_execution_date on update to allow the user to shift the schedule.
    // The DB trigger handles generating transactions if this date is <= today.
    const { error } = await supabase
      .from("recurring_payments")
      .update({
        wallet_id: data.wallet_id,
        category_id: data.category_id || null,
        description: data.description,
        amount: finalAmount,
        currency_code: data.currency_code,
        type: data.type,
        frequency: data.frequency,
        next_execution_date: data.start_date,
        end_date: data.end_date || null,
      })
      .eq("id", data.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    updateTag(`recurring-${user.id}`);
    updateTag(`transactions-${user.id}`);
    updateTag(`wallets-${user.id}`);
    
    return { success: true, message: 'Scheduled payment updated successfully' };
  });
}

export async function updateRecurringPaymentStatus(id: string, payload: UpdateRecurringPaymentStatusPayload): Promise<ActionResponse> {
  return executeValidatedAction(updateRecurringPaymentStatusSchema, payload, async (user, data) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("recurring_payments")
      .update({ status: data.status })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    updateTag(`recurring-${user.id}`);
    
    return { success: true, message: `Payment ${data.status} successfully` };
  });
}

export async function deleteRecurringPayment(id: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("recurring_payments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    updateTag(`recurring-${user.id}`);
    
    return { success: true, message: 'Scheduled payment deleted successfully' };
  });
}

export async function skipRecurringPayment(id: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabase = await createClient();

    const { data: rp, error: fetchError } = await supabase
      .from("recurring_payments")
      .select("next_execution_date, frequency")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !rp) {
      throw new Error(fetchError?.message || "Recurring payment not found");
    }

    if (rp.frequency === 'once') {
      return { success: false, message: "Cannot skip a one-time payment" };
    }

    const start = new Date(rp.next_execution_date);
    const frequency = rp.frequency;
    
    if (frequency === 'daily') start.setDate(start.getDate() + 1);
    else if (frequency === 'weekly') start.setDate(start.getDate() + 7);
    else if (frequency === 'monthly') start.setMonth(start.getMonth() + 1);
    else if (frequency === 'yearly') start.setFullYear(start.getFullYear() + 1);

    const newNextDate = start.toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from("recurring_payments")
      .update({ next_execution_date: newNextDate })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    updateTag(`recurring-${user.id}`);
    
    return { success: true, message: 'Payment execution skipped successfully' };
  });
}

export async function fetchRecurringHistoryAction(recurringId: string): Promise<ActionResponse<any>> {
  return executeAction(async (user) => {
    logger.info('Fetching recurring history', { userId: user.id, recurringId });
    const data = await getRecurringHistory(user.id, recurringId);
    return { success: true, data };
  });
}
