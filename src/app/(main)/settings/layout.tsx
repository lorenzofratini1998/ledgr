import { Metadata } from "next";
import { SettingsNav } from "@/features/preferences/components/settings-nav";
import { getTranslator } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "General",
    href: "/settings/general",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
  {
    title: "Security & Notifications",
    href: "/settings/security",
  },
];

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { t } = await getTranslator();

  const navItems = sidebarNavItems.map(item => ({
    ...item,
    title: t(`settings.nav.${item.title.toLowerCase().split(' ')[0]}` as any)
  }));

  return (
    <div className="space-y-6 p-4 md:p-10 pb-16 max-w-6xl mx-auto w-full">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t("navigation.settings")}</h2>
        <p className="text-muted-foreground">
          {t("settings.nav.profile")}, {t("settings.nav.general")}, {t("settings.nav.appearance")}, {t("settings.nav.security")}
        </p>
      </div>
      <div className="shrink-0 bg-border h-[1px] w-full" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SettingsNav items={navItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
