'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Notification } from '@/types/models';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

export function RealtimeNotificationListener() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    const channel = supabase
      .channel('global_realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            const notifData =
              typeof newNotif.data === 'object' && newNotif.data !== null
                ? (newNotif.data as Record<string, unknown>)
                : {};
            const targetUrl =
              typeof notifData.target_url === 'string' ? notifData.target_url : undefined;

            toast(newNotif.title, {
              description: newNotif.message,
              action: targetUrl
                ? {
                    label: tRef.current('notifications.view' as TranslationKey) || 'View',
                    onClick: () => {
                      window.location.href = targetUrl;
                    },
                  }
                : undefined,
            });
          }

          // Invalidate React Query cache
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);

  return null;
}
