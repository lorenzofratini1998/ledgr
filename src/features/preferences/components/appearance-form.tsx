"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import React, { useTransition } from "react";
import { useTheme } from "next-themes";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateAppearancePreferences } from "@/features/preferences/actions";
import { updateAppearancePreferencesSchema, UpdateAppearancePreferencesPayload } from "@/features/preferences/schemas";

interface AppearanceFormProps {
  preferences: any;
}

export function AppearanceForm({ preferences }: AppearanceFormProps) {
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const savedThemeRef = React.useRef(preferences.theme || "system");

  React.useEffect(() => {
    savedThemeRef.current = preferences.theme || "system";
  }, [preferences.theme]);

  React.useEffect(() => {
    return () => {
      setTheme(savedThemeRef.current);
    };
  }, [setTheme]);

  const form = useForm<UpdateAppearancePreferencesPayload>({
    resolver: zodResolver(updateAppearancePreferencesSchema),
    defaultValues: {
      theme: preferences.theme || "system",
    },
  });

  function onSubmit(data: UpdateAppearancePreferencesPayload) {
    // Optimistic local update
    setTheme(data.theme);
    
    startTransition(async () => {
      try {
        await updateAppearancePreferences(data);
        toast.success(t("settings.appearance.success"));
      } catch (error: any) {
        toast.error(t("settings.appearance.error"), { description: error.message });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t("settings.appearance.theme_label")}</FormLabel>
              <FormDescription>
                {t("settings.appearance.theme_desc")}
              </FormDescription>
              <FormMessage />
              <FormControl>
                <RadioGroup
                  onValueChange={(v) => {
                    field.onChange(v);
                    setTheme(v);
                  }}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <RadioGroupItem value="light" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1">
                      {t("settings.appearance.light")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl>
                      <RadioGroupItem value="dark" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1">
                      {t("settings.appearance.dark")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 bg-muted/50">
                    <FormControl>
                      <RadioGroupItem value="system" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1">
                      {t("settings.appearance.system")}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isPending}>
          {isPending ? t("settings.appearance.updating_btn") : t("settings.appearance.update_btn")}
        </Button>
      </form>
    </Form>
  );
}
