import { Database, Json } from '@/types/database.types';
import { Notification } from '@/types/models';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  }
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  } else {
    query = query.limit(50);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data as Notification[]) || [];
}

export async function getUnreadNotificationsCount(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function markNotificationAsRead(
  supabase: SupabaseClient<Database>,
  userId: string,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('is_read', false)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }
}

export async function softDeleteNotification(
  supabase: SupabaseClient<Database>,
  userId: string,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function getUserPushSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('user_push_subscriptions')
    .select('*')
    .eq('profile_id', userId);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveUserPushSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  deviceName: string,
  subscriptionPayload: Json
) {
  const { data, error } = await supabase
    .from('user_push_subscriptions')
    .upsert(
      {
        profile_id: userId,
        device_name: deviceName,
        subscription_payload: subscriptionPayload,
      },
      {
        onConflict: 'profile_id,device_name',
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteUserPushSubscription(
  supabase: SupabaseClient<Database>,
  userId: string,
  deviceName: string
) {
  const { error } = await supabase
    .from('user_push_subscriptions')
    .delete()
    .eq('profile_id', userId)
    .eq('device_name', deviceName);

  if (error) {
    throw error;
  }
}
