'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationsAction,
  fetchUnreadCountAction,
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
  deleteNotificationAction,
} from '../actions';
import { Notification } from '@/types/models';

export function useNotifications(options?: { unreadOnly?: boolean }) {
  const queryClient = useQueryClient();

  // Query unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await fetchUnreadCountAction();
      if (!res.success) return 0;
      return res.data ?? 0;
    },
    staleTime: 30000,
  });

  // Query notifications list
  const {
    data: notifications = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications', { unreadOnly: options?.unreadOnly }],
    queryFn: async () => {
      const res = await fetchNotificationsAction({
        unreadOnly: options?.unreadOnly,
        limit: 50,
      });
      if (!res.success) return [];
      return res.data || [];
    },
    staleTime: 10000,
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await markNotificationAsReadAction({ id });
      if (!res.success) throw new Error(res.message);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      queryClient.setQueryData<Notification[]>(
        ['notifications', { unreadOnly: options?.unreadOnly }],
        (old = []) =>
          old.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );

      queryClient.setQueryData<number>(['notifications-unread-count'], (old = 1) => Math.max(0, old - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await markAllNotificationsAsReadAction();
      if (!res.success) throw new Error(res.message);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      queryClient.setQueryData<Notification[]>(
        ['notifications', { unreadOnly: options?.unreadOnly }],
        (old = []) => old.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );

      queryClient.setQueryData<number>(['notifications-unread-count'], 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNotificationAction({ id });
      if (!res.success) throw new Error(res.message);
      return id;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      queryClient.setQueryData<Notification[]>(
        ['notifications', { unreadOnly: options?.unreadOnly }],
        (old = []) => old.filter((n) => n.id !== id)
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    isRefetching,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}
