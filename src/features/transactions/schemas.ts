import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  type: z.enum(["income", "expense"]),
  currency_code: z.string().length(3),
  wallet_id: z.string().uuid("Please select a wallet"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  category_id: z.union([
    z.string().uuid("Please select a valid category"),
    z.literal("")
  ]).optional().nullable(),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string().uuid()).optional(),
});

export type CreateTransactionPayload = z.infer<typeof createTransactionSchema>;
