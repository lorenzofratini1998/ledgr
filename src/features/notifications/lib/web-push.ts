import webpush from 'web-push';
import { logger } from '@/lib/logger';

// Default VAPID details (can be configured via environment variables)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@ledgr.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (err) {
    logger.warn('Failed to configure web-push VAPID details', { error: err });
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    notificationId?: string;
    [key: string]: unknown;
  };
}

export async function sendWebPushNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn('Web Push VAPID keys not configured in environment variables');
    return false;
  }

  try {
    const stringifiedPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      data: payload.data || {},
    });

    await webpush.sendNotification(
      subscription as unknown as webpush.PushSubscription,
      stringifiedPayload
    );
    return true;
  } catch (error: unknown) {
    const isGone = typeof error === 'object' && error !== null && 'statusCode' in error && ((error as { statusCode: number }).statusCode === 404 || (error as { statusCode: number }).statusCode === 410);
    if (isGone) {
      logger.info('Push subscription expired or gone', { endpoint: subscription.endpoint });
    } else {
      logger.error(error, 'Error sending push notification');
    }
    return false;
  }
}
