import { createClient } from "@/lib/supabase/server";
import { getUserPreferences } from "@/features/preferences/queries";
import { SecurityForm } from "@/features/preferences/components/security-form";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";

export default async function SettingsSecurityPage() {
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
        <h3 className="text-lg font-medium">{t("settings.security.title")}</h3>
      </div>
      <Separator />
      <SecurityForm preferences={prefs} />
    </div>
  );
}
