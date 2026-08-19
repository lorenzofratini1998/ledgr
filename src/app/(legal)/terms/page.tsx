import { getTranslator } from "@/i18n/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, CheckCircle2, Lock, Database, AlertTriangle } from "lucide-react";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t("legal.terms.title"),
    description: t("legal.terms.subtitle"),
  };
}

export default async function TermsPage() {
  const { t } = await getTranslator();

  const sections = [
    {
      icon: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.terms.sections.acceptance_title"),
      desc: t("legal.terms.sections.acceptance_desc"),
    },
    {
      icon: <FileText className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.terms.sections.financial_title"),
      desc: t("legal.terms.sections.financial_desc"),
    },
    {
      icon: <Lock className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.terms.sections.account_title"),
      desc: t("legal.terms.sections.account_desc"),
    },
    {
      icon: <Database className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.terms.sections.data_title"),
      desc: t("legal.terms.sections.data_desc"),
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-primary shrink-0" />,
      title: t("legal.terms.sections.termination_title"),
      desc: t("legal.terms.sections.termination_desc"),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
          <Shield className="h-3.5 w-3.5" />
          <span>Ledgr Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("legal.terms.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("legal.terms.subtitle")}
        </p>
        <p className="text-xs text-muted-foreground/70 font-mono">
          {t("legal.terms.lastUpdated")}
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
