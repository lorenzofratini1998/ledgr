'use server';

import { createClient } from '@/lib/supabase/server';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag } from 'next/cache';
import {
  deleteNotificationSchema,
  DeleteNotificationPayload,
  markNotificationAsReadSchema,
  MarkNotificationAsReadPayload,
  savePushSubscriptionSchema,
  SavePushSubscriptionPayload,
  deletePushSubscriptionSchema,
  DeletePushSubscriptionPayload,
} from './schemas';
import {
  deleteUserPushSubscription,
  getNotifications,
  getUnreadNotificationsCount,
  getUserPushSubscriptions,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  saveUserPushSubscription,
  softDeleteNotification,
} from './queries';
import { sendWebPushNotification } from './lib/web-push';
import { logger } from '@/lib/logger';
import { Notification } from '@/types/models';

export async function fetchNotificationsAction(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<ActionResponse<Notification[]>> {
  return executeAction(async (user) => {
    const supabase = await createClient();
    const data = await getNotifications(supabase, user.id, options);
    return {
      success: true,
      message: 'Notifications fetched successfully',
      data,
    };
  });
}

export async function fetchUnreadCountAction(): Promise<ActionResponse<number>> {
  return executeAction(async (user) => {
    const supabase = await createClient();
    const count = await getUnreadNotificationsCount(supabase, user.id);
    return {
      success: true,
      message: 'Unread count fetched successfully',
      data: count,
    };
  });
}

export async function markNotificationAsReadAction(
  payload: MarkNotificationAsReadPayload
): Promise<ActionResponse> {
  return executeValidatedAction(markNotificationAsReadSchema, payload, async (user, data) => {
    const supabase = await createClient();
    await markNotificationAsRead(supabase, user.id, data.id);

    revalidatePath('/dashboard');
    updateTag(`notifications-${user.id}`);

    return {
      success: true,
      message: 'Notification marked as read',
    };
  });
}

export async function markAllNotificationsAsReadAction(): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabase = await createClient();
    await markAllNotificationsAsRead(supabase, user.id);

    revalidatePath('/dashboard');
    updateTag(`notifications-${user.id}`);

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  });
}

export async function deleteNotificationAction(
  payload: DeleteNotificationPayload
): Promise<ActionResponse> {
  return executeValidatedAction(deleteNotificationSchema, payload, async (user, data) => {
    const supabase = await createClient();
    await softDeleteNotification(supabase, user.id, data.id);

    revalidatePath('/dashboard');
    updateTag(`notifications-${user.id}`);

    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  });
}

export async function savePushSubscriptionAction(
  payload: SavePushSubscriptionPayload
): Promise<ActionResponse> {
  return executeValidatedAction(savePushSubscriptionSchema, payload, async (user, data) => {
    const supabase = await createClient();
    await saveUserPushSubscription(
      supabase,
      user.id,
      data.device_name,
      data.subscription_payload
    );

    logger.info('Push subscription saved', { userId: user.id, deviceName: data.device_name });

    return {
      success: true,
      message: 'Push subscription registered successfully',
    };
  });
}

export async function deletePushSubscriptionAction(
  payload: DeletePushSubscriptionPayload
): Promise<ActionResponse> {
  return executeValidatedAction(deletePushSubscriptionSchema, payload, async (user, data) => {
    const supabase = await createClient();
    await deleteUserPushSubscription(supabase, user.id, data.device_name);

    logger.info('Push subscription deleted', { userId: user.id, deviceName: data.device_name });

    return {
      success: true,
      message: 'Push subscription removed successfully',
    };
  });
}

interface StoredPushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendTestPushNotificationAction(): Promise<ActionResponse> {
  return executeAction(async (user) => {
    const supabase = await createClient();
    const subscriptions = await getUserPushSubscriptions(supabase, user.id);

    if (!subscriptions || subscriptions.length === 0) {
      return {
        success: false,
        message: 'No push subscriptions found for this account',
      };
    }

    const { data: pref } = await supabase
      .from('user_preferences')
      .select('language_locale')
      .eq('profile_id', user.id)
      .single();

    const isItalian = (pref?.language_locale || 'en-US').startsWith('it');
    const testTitle = isItalian ? 'Notifica di Prova Ledgr' : 'Ledgr Test Notification';
    const testBody = isItalian
      ? 'Le notifiche push sono configurate correttamente su questo dispositivo! 🚀'
      : 'Push notifications are properly configured on this device! 🚀';

    let sentCount = 0;
    for (const sub of subscriptions) {
      const payload = sub.subscription_payload as unknown as StoredPushSubscriptionPayload;
      if (payload && payload.endpoint && payload.keys) {
        const sent = await sendWebPushNotification(payload, {
          title: testTitle,
          body: testBody,
          data: { url: '/dashboard' },
        });
        if (sent) sentCount++;
      }
    }

    return {
      success: true,
      message: `Test notification sent to ${sentCount} device(s)`,
    };
  });
}
