"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTransition } from "react";
import { useTranslation } from "@/i18n/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/preferences/actions";
import { updateProfileSchema, UpdateProfilePayload } from "@/features/preferences/schemas";

interface ProfileFormProps {
  profile: {
    username: string;
    display_name: string | null;
  };
  email: string;
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const form = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: profile.username || "",
      display_name: profile.display_name || "",
    },
  });

  function onSubmit(data: UpdateProfilePayload) {
    startTransition(async () => {
      try {
        await updateProfile(data);
        toast.success(t("settings.profile.success"));
      } catch (error: any) {
        toast.error(t("settings.profile.error"), { description: error.message });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t("settings.profile.email_label")}</label>
          <Input disabled value={email} />
          <p className="text-[0.8rem] text-muted-foreground">
            {t("settings.profile.email_desc")}
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.username_label")}</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                {t("settings.profile.username_desc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="display_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.profile.display_name_label")}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                {t("settings.profile.display_name_desc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton isPending={isPending} loadingText={t("settings.profile.updating_btn")} className="w-auto">
          {t("settings.profile.update_btn")}
        </SubmitButton>
      </form>
    </Form>
  );
}
