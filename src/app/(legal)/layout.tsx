import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslator } from "@/i18n/server";

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getTranslator();

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col pt-safe pb-safe">
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
              L
            </div>
            <span>Ledgr</span>
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("legal.backToLogin")}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Ledgr. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">
              {t("auth.terms.tos")}
            </Link>
            <Link href="/privacy" className="hover:underline">
              {t("auth.terms.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
