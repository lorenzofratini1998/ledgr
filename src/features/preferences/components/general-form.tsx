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
import { Input } from "@/components/ui/input";
import { updateGeneralPreferences } from "@/features/preferences/actions";
import { updateGeneralPreferencesSchema, UpdateGeneralPreferencesPayload } from "@/features/preferences/schemas";

interface GeneralFormProps {
  preferences: any;
  activeLocales: any[];
}

export function GeneralForm({ preferences, activeLocales }: GeneralFormProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const form = useForm<UpdateGeneralPreferencesPayload>({
    resolver: zodResolver(updateGeneralPreferencesSchema),
    defaultValues: {
      language_locale: preferences.language_locale,
      date_format: preferences.date_format,
      default_dashboard_range: preferences.default_dashboard_range,
    },
  });

  const currentLocale = form.watch("language_locale");
  const currentDateFormat = form.watch("date_format");

  // Generate previews
  const previewNumber = new Intl.NumberFormat(currentLocale || "en-US", {
    style: "currency",
    currency: preferences.primary_currency_code || "USD",
  }).format(1234.56);

  let previewDate = "";
  if (currentDateFormat === "DD/MM/YYYY") previewDate = "31/12/2026";
  else if (currentDateFormat === "YYYY-MM-DD") previewDate = "2026-12-31";
  else if (currentDateFormat === "MM/DD/YYYY") previewDate = "12/31/2026";
  else previewDate = "31/12/2026";

  let previewCurrencyLabel = "Currency Format";
  let previewDateLabel = "Date Format";
  let previewTitle = "Live Preview";

  if (currentLocale?.startsWith("it")) {
    previewCurrencyLabel = "Formato Valuta";
    previewDateLabel = "Formato Data";
    previewTitle = "Anteprima";
  } else if (currentLocale?.startsWith("es")) {
    previewCurrencyLabel = "Formato de Moneda";
    previewDateLabel = "Formato de Fecha";
    previewTitle = "Vista Previa";
  } else if (currentLocale?.startsWith("fr")) {
    previewCurrencyLabel = "Format de Devise";
    previewDateLabel = "Format de Date";
    previewTitle = "Aperçu en direct";
  } else if (currentLocale?.startsWith("de")) {
    previewCurrencyLabel = "Währungsformat";
    previewDateLabel = "Datumsformat";
    previewTitle = "Live-Vorschau";
  }

  function onSubmit(data: UpdateGeneralPreferencesPayload) {
    startTransition(async () => {
      try {
        await updateGeneralPreferences(data);
        toast.success(t("settings.general.success"));
        
        // Reload to apply language changes across all server and client components immediately
        window.location.reload();
      } catch (error: any) {
        toast.error(t("settings.general.error"), { description: error.message });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t("settings.general.primary_currency_label")}</label>
          <Input disabled value={preferences.primary_currency_code} />
          <p className="text-[0.8rem] text-muted-foreground">
            {t("settings.general.primary_currency_desc")}
          </p>
        </div>

        <FormField
          control={form.control}
          name="language_locale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.general.language_label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.general.language_placeholder")}>
                      {activeLocales.find((l) => l.locale === field.value)?.native_name || t("settings.general.language_placeholder")}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeLocales.map((locale) => (
                    <SelectItem key={locale.locale} value={locale.locale}>
                      {locale.native_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t("settings.general.language_desc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.general.date_format_label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.general.date_format_placeholder")}>
                      {field.value || t("settings.general.date_format_placeholder")}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="default_dashboard_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("settings.general.dashboard_range_label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.general.dashboard_range_placeholder")}>
                      {{
                        "7d": t("dashboard.periods.7d"),
                        "30d": t("dashboard.periods.30d"),
                        "90d": t("dashboard.periods.90d"),
                        "6m": t("dashboard.periods.6m"),
                        "1y": t("dashboard.periods.1y"),
                        "ytd": t("dashboard.periods.ytd"),
                      }[field.value as string] || t("settings.general.dashboard_range_placeholder")}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="7d">{t("dashboard.periods.7d")}</SelectItem>
                  <SelectItem value="30d">{t("dashboard.periods.30d")}</SelectItem>
                  <SelectItem value="90d">{t("dashboard.periods.90d")}</SelectItem>
                  <SelectItem value="6m">{t("dashboard.periods.6m")}</SelectItem>
                  <SelectItem value="1y">{t("dashboard.periods.1y")}</SelectItem>
                  <SelectItem value="ytd">{t("dashboard.periods.ytd")}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t("settings.general.dashboard_range_desc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
          <h4 className="font-semibold text-sm">{previewTitle}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{previewCurrencyLabel}</p>
              <p className="font-medium">{previewNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{previewDateLabel}</p>
              <p className="font-medium">{previewDate}</p>
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isPending}>
          {isPending ? t("settings.general.updating_btn") : t("settings.general.update_btn")}
        </Button>
      </form>
    </Form>
  );
}
