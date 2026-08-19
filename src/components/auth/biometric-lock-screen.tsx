"use client";

import { useState } from "react";
import { Fingerprint, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/hooks/use-translation";

interface BiometricLockScreenProps {
  onUnlock: () => Promise<boolean>;
  isAuthenticating: boolean;
}

export function BiometricLockScreen({
  onUnlock,
  isAuthenticating,
}: BiometricLockScreenProps) {
  const { t } = useTranslation();
  const [hasFailed, setHasFailed] = useState(false);

  const handleUnlockClick = async () => {
    setHasFailed(false);
    const success = await onUnlock();
    if (!success) {
      setHasFailed(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl px-6 select-none pt-safe pb-safe animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
    >
      <div className="flex flex-col items-center max-w-sm w-full text-center space-y-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-1 ring-primary/20 shadow-inner">
            <Lock className="h-10 w-10 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground shadow-sm">
            <Fingerprint className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 id="lock-title" className="text-2xl font-bold tracking-tight text-foreground">
            {t("lockScreen.title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("lockScreen.description")}
          </p>
        </div>

        {hasFailed && (
          <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 text-xs px-3 py-2 rounded-lg w-full text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{t("lockScreen.auth_failed")}</span>
          </div>
        )}

        <div className="w-full space-y-3 pt-2">
          <Button
            size="lg"
            className="w-full gap-2.5 text-base font-semibold h-13 rounded-xl shadow-md transition-all active:scale-[0.98]"
            onClick={handleUnlockClick}
            disabled={isAuthenticating}
          >
            <Fingerprint className={`h-5 w-5 ${isAuthenticating ? "animate-pulse" : ""}`} />
            {isAuthenticating
              ? t("lockScreen.authenticating")
              : hasFailed
              ? t("lockScreen.unlock_again")
              : t("lockScreen.unlock_btn")}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ledgr Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
