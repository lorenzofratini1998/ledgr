import { type Dictionary } from "@/i18n/dictionaries/en";
import * as z from "zod";

export const getLoginSchema = (t: Dictionary['auth']['login']['errors']) => z.object({
  email: z.email({ message: t.invalidEmail }),
  password: z.string().min(1, { message: t.passwordRequired }),
});

export const getRegisterSchema = (t: Dictionary['auth']['register']['errors']) => z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: t.invalidEmail }),
  password: z
    .string()
    .min(8, { message: t.passwordMin })
    .regex(/[A-Z]/, { message: t.passwordUppercase })
    .regex(/[0-9]/, { message: t.passwordNumber })
    .regex(/[^A-Za-z0-9]/, { message: t.passwordSpecial }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t.passwordMismatch,
  path: ["confirmPassword"],
});
