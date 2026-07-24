"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/actions";
import { useActionMutation } from "@/hooks/use-action-mutation";
import { useTranslation } from "@/i18n/hooks/use-translation";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { getLoginSchema, getRegisterSchema } from "@/features/auth/schemas";


function OAuthProviders({ providers }: { providers: string[] }) {
  const { t } = useTranslation();
  const socialProviders = providers.filter(p => p !== 'email');
  if (socialProviders.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-2">
        {socialProviders.includes("apple") && (
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
              <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
              />
            </svg>
            {t('auth.social.apple')}
          </Button>
        )}
        {socialProviders.includes("google") && (
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {t('auth.social.google')}
          </Button>
        )}
        {socialProviders.includes("github") && (
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-4">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            {t('auth.social.github')}
          </Button>
        )}
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          {t('auth.social.orContinueWith')}
        </span>
      </div>
    </>
  );
}

function LoginSubForm() {
  const { t, dictionary } = useTranslation();
  const loginSchema = useMemo(() => getLoginSchema(dictionary.auth.login.errors), [dictionary.auth.login.errors]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useActionMutation(loginForm, {
    action: signInWithEmail,
    successMessage: (res) => res.message || "Logged in successfully",
    errorMessage: (res) => res.message || "Login failed",
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({ email: values.email, password: values.password });
  };

  return (
    <Form key="login" {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.login.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.login.emailPlaceholder') as string} type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('auth.login.passwordLabel')}</FormLabel>
                <Link href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>
    </Form>
  );
}

function RegisterSubForm() {
  const { t, dictionary } = useTranslation();
  const registerSchema = useMemo(() => getRegisterSchema(dictionary.auth.register.errors), [dictionary.auth.register.errors]);

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useActionMutation(registerForm, {
    action: signUpWithEmail,
    successMessage: (res) => res.message || "Registered successfully",
    errorMessage: (res) => res.message || "Registration failed",
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
  });

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    mutate({
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      firstName: values.firstName || "",
      lastName: values.lastName || "",
    });
  };

  return (
    <Form key="register" {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={registerForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.firstNameLabel')} <span className="text-muted-foreground font-normal">{t('auth.register.optional')}</span></FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.register.firstNamePlaceholder') as string} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.register.lastNameLabel')} <span className="text-muted-foreground font-normal">{t('auth.register.optional')}</span></FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.register.lastNamePlaceholder') as string} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.emailLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.register.emailPlaceholder') as string} type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.register.confirmPasswordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          {isPending ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>
    </Form>
  );
}

export function LoginForm({
  className,
  providers,
  ...props
}: React.ComponentProps<"div"> & { providers: string[] }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const hasSocialProviders = providers.some(p => p !== "email");

  const toggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "login" ? t('auth.login.title') : t('auth.register.title')}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? (hasSocialProviders ? t('auth.login.description') : t('auth.login.descriptionEmailOnly'))
              : (hasSocialProviders ? t('auth.register.description') : t('auth.register.descriptionEmailOnly'))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <OAuthProviders providers={providers} />

            {mode === "login" ? <LoginSubForm /> : <RegisterSubForm />}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "login" ? t('auth.login.noAccount') : t('auth.register.hasAccount')}
              {" "}
              <button type="button" onClick={toggleMode} className="underline underline-offset-4 hover:text-foreground">
                {mode === "login" ? t('auth.login.switchToSignUp') : t('auth.register.switchToLogin')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="px-6 text-center text-sm text-muted-foreground">
        {t('auth.terms.agreement')}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          {t('auth.terms.tos')}
        </a>{" "}
        {t('auth.terms.and')}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          {t('auth.terms.privacy')}
        </a>
        .
      </p>
    </div>
  );
}
