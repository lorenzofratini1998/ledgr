import { CreateWalletSchema } from '@/features/wallets/schemas';
import { z } from 'zod';

export const onboardingSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  date_format: z.enum(['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']),
  language_locale: z.string().min(2).max(5),
  primary_currency_code: z.string().length(3),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;

export const ecosystemSchema = z.object({
  categories: z.array(z.string()),
  wallet: z.preprocess(
    (val: any) => {
      if (val && typeof val === 'object' && !val.name?.trim()) {
        return null;
      }
      return val;
    },
    CreateWalletSchema.optional().nullable()
  )
});

export type EcosystemPayload = z.infer<typeof ecosystemSchema>;
