import { z } from 'zod';

export const onboardingSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  date_format: z.enum(['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']),
  language_locale: z.string().min(2).max(5),
  primary_currency_code: z.string().length(3),
});

export type OnboardingPayload = z.infer<typeof onboardingSchema>;
