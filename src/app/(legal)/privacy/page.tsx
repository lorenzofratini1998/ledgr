import { getTranslator } from "@/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Eye, Fingerprint, Lock, Bell, UserCheck } from "lucide-react";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("legal.privacy.title"),
    description: t("legal.privacy.subtitle"),
  };
}

export default async function PrivacyPage() {
  const { t } = await getTranslator();

  const sections = [
    {
      icon: <Eye className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.privacy.sections.collection_title"),
      desc: t("legal.privacy.sections.collection_desc"),
    },
    {
      icon: <Fingerprint className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.privacy.sections.biometrics_title"),
      desc: t("legal.privacy.sections.biometrics_desc"),
    },
    {
      icon: <Lock className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.privacy.sections.storage_title"),
      desc: t("legal.privacy.sections.storage_desc"),
    },
    {
      icon: <Bell className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.privacy.sections.push_title"),
      desc: t("legal.privacy.sections.push_desc"),
    },
    {
      icon: <UserCheck className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.privacy.sections.rights_title"),
      desc: t("legal.privacy.sections.rights_desc"),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>GDPR & Privacy First</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("legal.privacy.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("legal.privacy.subtitle")}
        </p>
        <p className="text-xs text-muted-foreground/70 font-mono">
          {t("legal.privacy.lastUpdated")}
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <Card key={idx} className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {sec.icon}
                </div>
                <CardTitle className="text-lg font-semibold">
                  {sec.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-foreground/80">
                {sec.desc}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
