import { createClient } from "@/lib/supabase/server";
import { getUserPreferences } from "@/features/preferences/queries";
import { AppearanceForm } from "@/features/preferences/components/appearance-form";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";

export default async function SettingsAppearancePage() {
  const { t } = await getTranslator();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const prefs = await getUserPreferences(user.id);
  
  if (!prefs) {
    return <div>Preferences not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.appearance.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.appearance.subtitle")}
        </p>
      </div>
      <Separator />
      <AppearanceForm preferences={prefs} />
    </div>
  );
}
