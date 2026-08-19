"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTransition } from "react";
import { useTranslation } from "@/i18n/hooks/use-translation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { updateSecurityPreferences } from "@/features/preferences/actions";
import { updateSecurityPreferencesSchema, UpdateSecurityPreferencesPayload } from "@/features/preferences/schemas";

import { PushSettingsCard } from "@/features/notifications/components/push-settings-card";

interface SecurityFormProps {
  preferences: any;
}

export function SecurityForm({ preferences }: SecurityFormProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const form = useForm<UpdateSecurityPreferencesPayload>({
    resolver: zodResolver(updateSecurityPreferencesSchema),
    defaultValues: {
      biometric_lock_enabled: preferences.biometric_lock_enabled,
      lock_timeout_seconds: preferences.lock_timeout_seconds,
      notify_budget_breach: preferences.notify_budget_breach,
      notify_recurring_reminder: preferences.notify_recurring_reminder,
      budget_alert_threshold: preferences.budget_alert_threshold,
    },
  });

  function onSubmit(data: UpdateSecurityPreferencesPayload) {
    startTransition(async () => {
      try {
        await updateSecurityPreferences(data);
        toast.success(t("settings.security.success"));
      } catch (error: any) {
        toast.error(t("settings.security.error"), { description: error.message });
      }
    });
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-medium">{t("settings.security.title")}</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="biometric_lock_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("settings.security.biometric_label")}
                      </FormLabel>
                      <FormDescription>
                        {t("settings.security.biometric_desc")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lock_timeout_seconds"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("settings.security.timeout_label")}
                      </FormLabel>
                      <FormDescription>
                        {t("settings.security.timeout_desc")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Select onValueChange={(val) => field.onChange(parseInt(val || "0"))} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("settings.security.timeout_placeholder")}>
                              {{
                                0: t("settings.security.timeout_immediately"),
                                10: t("settings.security.timeout_10s"),
                                30: t("settings.security.timeout_30s"),
                                60: t("settings.security.timeout_1m"),
                                300: t("settings.security.timeout_5m"),
                              }[field.value] ?? t("settings.security.timeout_placeholder")}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">{t("settings.security.timeout_immediately")}</SelectItem>
                          <SelectItem value="10">{t("settings.security.timeout_10s")}</SelectItem>
                          <SelectItem value="30">{t("settings.security.timeout_30s")}</SelectItem>
                          <SelectItem value="60">{t("settings.security.timeout_1m")}</SelectItem>
                          <SelectItem value="300">{t("settings.security.timeout_5m")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">{t("settings.security.notifications_title")}</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notify_recurring_reminder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("settings.security.recurring_label")}
                      </FormLabel>
                      <FormDescription>
                        {t("settings.security.recurring_desc")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notify_budget_breach"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("settings.security.budget_label")}
                      </FormLabel>
                      <FormDescription>
                        {t("settings.security.budget_desc")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget_alert_threshold"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("settings.security.threshold_label")}
                      </FormLabel>
                      <FormDescription>
                        {t("settings.security.threshold_desc")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={10} max={100}
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isPending}>
            {isPending ? t("settings.security.updating_btn") : t("settings.security.update_btn")}
          </Button>
        </form>
      </Form>

      <div className="pt-2">
        <h3 className="mb-4 text-lg font-medium">{t("settings.security.push_section_title" as any) || "Device & Push"}</h3>
        <PushSettingsCard />
      </div>
    </div>
  );
}


