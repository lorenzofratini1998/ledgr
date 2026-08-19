'use client';

import { useState } from 'react';
import { usePushSubscription } from '../hooks/use-push-subscription';
import { sendTestPushNotificationAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Send, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

export function PushSettingsCard() {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  const [isSendingTest, setIsSendingTest] = useState(false);
  const { t } = useTranslation();

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const res = await sendTestPushNotificationAction();
      if (res.success) {
        toast.success(t('notifications.testSentSuccess' as TranslationKey) || 'Test notification sent successfully!');
      } else {
        toast.error(res.message || t('notifications.testSentError' as TranslationKey) || 'Failed to send test notification');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="rounded-xl border p-5 bg-card/40 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">
              {t('notifications.pushTitle' as TranslationKey) || 'Device Push Notifications (PWA)'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {t('notifications.pushDesc' as TranslationKey) || 'Receive real-time alerts on your device even when the app is closed.'}
            </p>
          </div>
        </div>

        {isSupported && (
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        )}
      </div>

      {/* Status banner */}
      <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {!isSupported ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>{t('notifications.pushUnsupported' as TranslationKey) || 'Push notifications not supported on this browser'}</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{t('notifications.pushBlocked' as TranslationKey) || 'Notification permissions blocked in browser settings'}</span>
            </div>
          ) : isSubscribed ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('notifications.pushActive' as TranslationKey) || 'Push notifications active on this device'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span>{t('notifications.pushInactive' as TranslationKey) || 'Push notifications inactive on this device'}</span>
            </div>
          )}
        </div>

        {isSubscribed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            disabled={isSendingTest}
            className="h-8 text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {isSendingTest
                ? (t('notifications.sendingTest' as TranslationKey) || 'Sending...')
                : (t('notifications.sendTest' as TranslationKey) || 'Send test notification')}
            </span>
          </Button>
        )}
      </div>

      {/* iOS Help Note */}
      <div className="text-[11px] text-muted-foreground/80 bg-muted/40 p-2.5 rounded-lg border border-border/50">
        💡 {t('notifications.iosNote' as TranslationKey) || 'Note for Apple iOS: To receive push notifications on iPhone and iPad (iOS 16.4+), add Ledgr to your Home Screen from Safari share menu.'}
      </div>
    </div>
  );
}
