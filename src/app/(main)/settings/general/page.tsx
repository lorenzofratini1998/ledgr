import { createClient } from "@/lib/supabase/server";
import { getUserPreferences } from "@/features/preferences/queries";
import { getActiveLanguages } from "@/lib/constants/languages";
import { GeneralForm } from "@/features/preferences/components/general-form";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";

export default async function SettingsGeneralPage() {
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

  const { activeLocales } = await getActiveLanguages();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.general.title")}</h3>
      </div>
      <Separator />
      <GeneralForm 
        preferences={prefs} 
        activeLocales={activeLocales}
      />
    </div>
  );
}
