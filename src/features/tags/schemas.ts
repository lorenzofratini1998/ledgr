import { z } from 'zod';

export const createTagSchema = z.object({
  tag_name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  tag_description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export type CreateTagPayload = z.infer<typeof createTagSchema>;
