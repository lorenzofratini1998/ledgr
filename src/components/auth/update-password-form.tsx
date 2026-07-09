"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateUserPassword } from "@/app/actions/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type Dictionary } from "@/i18n/dictionaries/en";

const getUpdatePasswordSchema = (t: Dictionary['auth']['updatePassword']['errors']) => z.object({
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

export function UpdatePasswordForm({
  className,
  dictionary,
  ...props
}: React.ComponentProps<"div"> & { dictionary: Dictionary }) {
  const t = dictionary.auth.updatePassword;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const formSchema = getUpdatePasswordSchema(t.errors);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);

      const result = await updateUserPassword({ error: "" }, formData);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.passwordLabel}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.confirmPasswordLabel}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {serverError && (
                  <p className="text-sm text-destructive font-medium text-center">
                    {serverError}
                  </p>
                )}

                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                  {isPending ? t.submitting : t.submit}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
