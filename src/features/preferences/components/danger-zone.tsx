"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUserAccount } from "@/features/preferences/actions";

interface DangerZoneProps {
  email: string;
}

export function DangerZone({ email }: DangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation();

  const isConfirmed = confirmText === email || confirmText === "DELETE";

  const handleDeleteAccount = () => {
    if (!isConfirmed) return;
    
    startTransition(async () => {
      try {
        await deleteUserAccount();
        toast.success(t("settings.dangerZone.success"));
        router.push("/login");
      } catch (error: any) {
        toast.error(t("settings.dangerZone.error"), { description: error.message });
      }
    });
  };

  return (
    <div className="space-y-6 mt-12">
      <div>
        <h3 className="text-lg font-medium text-destructive">{t("settings.dangerZone.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("settings.dangerZone.subtitle")}
        </p>
      </div>

      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">{t("settings.dangerZone.delete_title")}</p>
          <p className="text-xs text-muted-foreground">
            {t("settings.dangerZone.delete_desc")}
          </p>
        </div>
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            {t("settings.dangerZone.delete_title")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.dangerZone.alert_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.dangerZone.alert_desc")}
                <br /><br />
                <span dangerouslySetInnerHTML={{ __html: t("settings.dangerZone.alert_confirm", { email }) }} />
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="my-4">
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full"
                disabled={isPending}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending} onClick={() => setConfirmText("")}>
                {t("settings.dangerZone.cancel")}
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!isConfirmed || isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 animate-spin" /> {t("settings.dangerZone.deleting_btn")}
                  </span>
                ) : (
                  t("settings.dangerZone.delete_title")
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
