'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { savePushSubscriptionAction, deletePushSubscriptionAction } from '../actions';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Device';
  const userAgent = navigator.userAgent;
  let device = 'Browser';

  if (/iPhone/i.test(userAgent)) device = 'iPhone';
  else if (/iPad/i.test(userAgent)) device = 'iPad';
  else if (/Android/i.test(userAgent)) device = 'Android Device';
  else if (/Macintosh/i.test(userAgent)) device = 'Mac';
  else if (/Windows/i.test(userAgent)) device = 'Windows PC';
  else if (/Linux/i.test(userAgent)) device = 'Linux PC';

  return `${device} (${navigator.language || 'en'})`;
}

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Check initial state
  const checkSubscription = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking push subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((sub) => {
          if (isMounted) {
            setIsSupported(true);
            setPermission(Notification.permission);
            setIsSubscribed(!!sub);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsSupported(false);
            setIsLoading(false);
          }
        });
    } else {
      Promise.resolve().then(() => {
        if (isMounted) {
          setIsSupported(false);
          setIsLoading(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      toast.error(tRef.current('notifications.pushUnsupported' as TranslationKey) || 'Push notifications not supported on this browser');
      return false;
    }

    setIsLoading(true);
    try {
      // 1. Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        toast.error(tRef.current('notifications.pushBlocked' as TranslationKey) || 'Notification permissions blocked in browser settings');
        setIsLoading(false);
        return false;
      }

      // 2. Get Service Worker registration
      const registration = await navigator.serviceWorker.ready;

      // 3. Get VAPID public key from env
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error('VAPID public key is not configured on server (.env.local NEXT_PUBLIC_VAPID_PUBLIC_KEY)');
        setIsLoading(false);
        return false;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Subscribe with PushManager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      const subscriptionJSON = subscription.toJSON();

      // 5. Send to Server Action
      const response = await savePushSubscriptionAction({
        device_name: getDeviceName(),
        subscription_payload: {
          endpoint: subscriptionJSON.endpoint || '',
          expirationTime: subscriptionJSON.expirationTime,
          keys: {
            p256dh: subscriptionJSON.keys?.p256dh || '',
            auth: subscriptionJSON.keys?.auth || '',
          },
        },
      });

      if (response.success) {
        setIsSubscribed(true);
        toast.success(tRef.current('notifications.testSentSuccess' as TranslationKey) || 'Push notifications active on this device');
        return true;
      } else {
        toast.error(response.message || 'Failed to save push subscription');
        return false;
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to enable push notifications: ' + msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      await deletePushSubscriptionAction({
        device_name: getDeviceName(),
      });

      setIsSubscribed(false);
      toast.success(tRef.current('notifications.pushInactive' as TranslationKey) || 'Push notifications disabled');
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to disable push notifications: ' + msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}
