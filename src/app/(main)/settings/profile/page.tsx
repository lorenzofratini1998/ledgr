import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/features/preferences/queries";
import { ProfileForm } from "@/features/preferences/components/profile-form";
import { DangerZone } from "@/features/preferences/components/danger-zone";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";

export default async function SettingsProfilePage() {
  const { t } = await getTranslator();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getUserProfile(user.id);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("settings.profile.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.profile.subtitle")}
        </p>
      </div>
      <Separator />
      <ProfileForm profile={profile} email={user.email || ''} />
      
      <DangerZone email={user.email || ''} />
    </div>
  );
}
