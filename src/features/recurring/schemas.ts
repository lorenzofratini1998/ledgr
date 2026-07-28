import { z } from "zod";

export const createRecurringPaymentSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  type: z.enum(["fixed", "variable"]),
  frequency: z.enum(["once", "daily", "weekly", "monthly", "yearly"]),
  currency_code: z.string().length(3),
  wallet_id: z.string().uuid("Please select a wallet"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.literal("").transform(() => undefined),
  ]).optional(),
  category_id: z.union([
    z.string().uuid("Please select a valid category"),
    z.literal("").transform(() => undefined),
  ]).optional(),
  description: z.string().min(1, "Description is required"),
  transaction_type: z.enum(["income", "expense"]), // Used to decide if amount is positive or negative
});

export type CreateRecurringPaymentPayload = z.infer<typeof createRecurringPaymentSchema>;

export const updateRecurringPaymentSchema = createRecurringPaymentSchema.extend({
  id: z.string().uuid("Invalid ID"),
});

export type UpdateRecurringPaymentPayload = z.infer<typeof updateRecurringPaymentSchema>;

export const updateRecurringPaymentStatusSchema = z.object({
  status: z.enum(["active", "paused", "completed"]),
});

export type UpdateRecurringPaymentStatusPayload = z.infer<typeof updateRecurringPaymentStatusSchema>;
