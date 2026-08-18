import { z } from 'zod';

export const MAX_QUICK_TRANSACTIONS = 5;

export const createQuickTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
  wallet_id: z.string().uuid('Please select a valid wallet'),
  category_id: z.string().uuid('Please select a valid category').or(z.literal('')).optional().nullable(),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  currency_code: z.string().length(3, 'Currency code must be 3 characters'),
  type: z.enum(['expense', 'income']),
  description: z.string().max(255, 'Description cannot exceed 255 characters').optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
  display_order: z.number().int().min(0).optional(),
});

export const updateQuickTransactionSchema = createQuickTransactionSchema.partial().extend({
  id: z.string().uuid('Invalid quick transaction ID'),
});

export const executeQuickTransactionSchema = z.object({
  id: z.string().uuid('Invalid quick transaction ID'),
});

export type CreateQuickTransactionPayload = z.infer<typeof createQuickTransactionSchema>;
export type UpdateQuickTransactionPayload = z.infer<typeof updateQuickTransactionSchema>;
export type ExecuteQuickTransactionPayload = z.infer<typeof executeQuickTransactionSchema>;
