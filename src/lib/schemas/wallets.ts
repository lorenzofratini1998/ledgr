import { z } from 'zod';

export const CreateWalletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['regular', 'savings', 'investment']),
  initial_balance: z
    .string()
    .regex(/^\d+(\.\d{1,4})?$/, 'Balance must be a valid positive number with up to 4 decimal places')
    .default('0.0000'),
  currency_code: z.string().length(3, 'Currency code must be exactly 3 characters'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CreateWalletPayload = z.infer<typeof CreateWalletSchema>;
