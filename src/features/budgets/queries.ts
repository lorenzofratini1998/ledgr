import { createClient } from "@/lib/supabase/server";
import { CreateBudgetInput, UpdateBudgetInput } from "./schemas";
import { getUserPreferences } from "@/features/preferences/queries";
import { logger } from "@/lib/logger";

export async function createBudget(data: CreateBudgetInput, userId: string) {
  const supabase = (await createClient()) as any;
  
  // Get user's base currency to use as the budget currency
  const preferences = await getUserPreferences(userId);
  const currencyCode = preferences?.primary_currency_code || "USD";

  try {
    const { data: budgetData, error: budgetError } = await supabase
      .from("budgets")
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        currency_code: currencyCode,
        start_date: data.start_date.toISOString().split("T")[0],
        end_date: data.end_date.toISOString().split("T")[0],
        is_global: data.is_global,
        type: data.type,
        recurrence: data.recurrence,
      })
      .select("budget_id")
      .single();

    if (budgetError) throw new Error(budgetError.message);

    if (!data.is_global && data.categories && data.categories.length > 0) {
      const budgetCategories = data.categories.map((cat: any) => ({
        budget_id: budgetData.budget_id,
        category_id: cat.category_id,
        allocation_amount: cat.allocation_amount || null,
      }));

      const { error: categoriesError } = await supabase
        .from("budget_categories")
        .insert(budgetCategories);

      if (categoriesError) {
        // Rollback budget
        await supabase.from("budgets").delete().eq("budget_id", budgetData.budget_id);
        throw new Error(categoriesError.message);
      }
    }

    // Trigger recalculation of spent_amount based on historical transactions
    await supabase.rpc('recalculate_budget', { p_budget_id: budgetData.budget_id });

    return budgetData;
  } catch (error) {
    logger.error(error as Error, "Failed to create budget in DB", { data, userId });
    throw error;
  }
}

export async function updateBudget(data: UpdateBudgetInput, userId: string) {
  const supabase = (await createClient()) as any;

  try {
    const { error: updateError } = await supabase
      .from("budgets")
      .update({
        name: data.name,
        description: data.description || null,
        amount: data.amount,
        start_date: data.start_date.toISOString().split("T")[0],
        end_date: data.end_date.toISOString().split("T")[0],
        is_global: data.is_global,
        type: data.type,
        recurrence: data.recurrence,
      })
      .eq("budget_id", data.budget_id)
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);

    // Update categories: simplest way is delete all and insert new
    const { error: deleteError } = await supabase
      .from("budget_categories")
      .delete()
      .eq("budget_id", data.budget_id);

    if (deleteError) throw new Error(deleteError.message);

    if (!data.is_global && data.categories && data.categories.length > 0) {
      const budgetCategories = data.categories.map((cat: any) => ({
        budget_id: data.budget_id,
        category_id: cat.category_id,
        allocation_amount: cat.allocation_amount || null,
      }));

      const { error: categoriesError } = await supabase
        .from("budget_categories")
        .insert(budgetCategories);

      if (categoriesError) throw new Error(categoriesError.message);
    }

    // Trigger recalculation of spent_amount based on historical transactions
    await supabase.rpc('recalculate_budget', { p_budget_id: data.budget_id });

  } catch (error) {
    logger.error(error as Error, "Failed to update budget in DB", { data, userId });
    throw error;
  }
}

export async function deleteBudget(budgetId: string, userId: string) {
  const supabase = (await createClient()) as any;

  try {
    // Soft delete
    const { error } = await supabase
      .from("budgets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("budget_id", budgetId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  } catch (error) {
    logger.error(error as Error, "Failed to delete budget in DB", { budgetId, userId });
    throw error;
  }
}

export async function getBudgets(userId: string) {
  const supabase = (await createClient()) as any;

  try {
    const { data, error } = await supabase
      .from("budgets")
      .select(`
        *,
        budget_categories (
          category_id,
          allocation_amount,
          categories (
            category_name,
            color,
            icon
          )
        )
      `)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    logger.error(error as Error, "Failed to fetch budgets from DB", { userId });
    throw error;
  }
}

export async function getBudgetById(budgetId: string, userId: string) {
  const supabase = (await createClient()) as any;
  try {
    const { data, error } = await supabase
      .from("budgets")
      .select(`
        *,
        budget_categories (
          category_id,
          allocation_amount,
          categories (
            category_name,
            color,
            icon
          )
        )
      `)
      .eq("budget_id", budgetId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    logger.error(error as Error, "Failed to fetch budget by id", { budgetId, userId });
    throw error;
  }
}

export async function getBudgetCategoryBreakdown(budgetId: string) {
  const supabase = (await createClient()) as any;
  try {
    const { data, error } = await supabase.rpc('get_budget_category_breakdown', { p_budget_id: budgetId });
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    logger.error(error as Error, "Failed to fetch budget category breakdown", { budgetId });
    return [];
  }
}

export async function getBudgetDailyPacing(budgetId: string) {
  const supabase = (await createClient()) as any;
  try {
    const { data, error } = await supabase.rpc('get_budget_daily_pacing', { p_budget_id: budgetId });
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    logger.error(error as Error, "Failed to fetch budget daily pacing", { budgetId });
    return [];
  }
}
