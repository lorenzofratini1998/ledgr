"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { requestPasswordReset } from "@/app/actions/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type Dictionary } from "@/i18n/dictionaries/en";
import Link from "next/link";

const getForgotPasswordSchema = (t: Dictionary['auth']['forgotPassword']['errors']) => z.object({
  email: z.string().email({ message: t.invalidEmail }),
});

export function ForgotPasswordForm({
  className,
  dictionary,
  ...props
}: React.ComponentProps<"div"> & { dictionary: Dictionary }) {
  const t = dictionary.auth.forgotPassword;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const formSchema = getForgotPasswordSchema(t.errors);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const response = await requestPasswordReset({ email: values.email });
        if (response.success) {
          setSuccess(true);
          toast.success(response.message || "Password reset email sent.");
        } else {
          if (response.errors) {
            Object.entries(response.errors).forEach(([field, messages]) => {
              form.setError(field as Parameters<typeof form.setError>[0], {
                type: "server",
                message: messages[0],
              });
            });
          }
          toast.error(response.message || "Failed to send reset email");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
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
            {success ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-sm text-muted-foreground">{t.successMessage}</p>
                <Button render={<Link href="/login" />} nativeButton={false} className="w-full mt-2">
                  {t.backToLogin}
                </Button>
              </div>
            ) : (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.emailLabel}</FormLabel>
                          <FormControl>
                            <Input placeholder={t.emailPlaceholder} type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />


                    <Button type="submit" className="w-full mt-2" disabled={isPending}>
                      {isPending ? t.submitting : t.submit}
                    </Button>
                  </form>
                </Form>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                    {t.backToLogin}
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
