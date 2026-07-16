import { z } from 'zod';

export const CreateCategorySchema = z.object({
  category_name: z
    .string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must be less than 255 characters'),
  category_description: z.string().optional().nullable(),
  parent_id: z
    .union([z.string().uuid('Invalid parent ID'), z.literal('')])
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export type CreateCategoryPayload = z.infer<typeof CreateCategorySchema>;
