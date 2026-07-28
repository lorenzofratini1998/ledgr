import { z } from "zod";

export const budgetCategorySchema = z.object({
  category_id: z.string().uuid(),
  allocation_amount: z.coerce.number().positive().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  start_date: z.date(),
  end_date: z.date(),
  is_global: z.boolean().default(false),
  type: z.enum(["expense", "income"]).default("expense"),
  recurrence: z.enum(["none", "weekly", "monthly", "yearly"]).default("none"),
  categories: z.array(budgetCategorySchema).optional(),
}).refine(
  (data) => data.end_date >= data.start_date,
  {
    message: "End date must be after or equal to start date",
    path: ["end_date"],
  }
).refine(
  (data) => {
    if (data.is_global) return true;
    return data.categories && data.categories.length > 0;
  },
  {
    message: "At least one category is required for a categorized budget",
    path: ["categories"],
  }
).refine(
  (data) => {
    if (data.is_global || !data.categories) return true;
    
    // Check if sum of allocations exceeds total budget amount
    const totalAllocated = data.categories.reduce((sum, cat) => sum + (cat.allocation_amount || 0), 0);
    return totalAllocated <= data.amount;
  },
  {
    message: "Sum of category allocations cannot exceed total budget amount",
    path: ["categories"],
  }
);

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = createBudgetSchema.extend({
  budget_id: z.string().uuid(),
});

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
