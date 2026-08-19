'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

interface NotificationListProps {
  onCloseParent?: () => void;
}

export function NotificationList({ onCloseParent }: NotificationListProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { t } = useTranslation();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({
    unreadOnly: filter === 'unread',
  });

  return (
    <div className="flex flex-col h-full max-h-[70vh] sm:max-h-[500px]">
      {/* Header & Filters */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-background/80 backdrop-blur">
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('notifications.all' as TranslationKey) || 'All'}
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t('notifications.unread' as TranslationKey) || 'Unread'}</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 px-2.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>{t('notifications.markAllAsRead' as TranslationKey) || 'Mark all read'}</span>
          </Button>
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium">
              {t('notifications.loading' as TranslationKey) || 'Loading notifications...'}
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-3.5 rounded-full bg-muted/60 text-muted-foreground mb-3">
              <Bell className="h-6 w-6 opacity-60" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {filter === 'unread'
                ? t('notifications.noUnread' as TranslationKey) || 'No unread notifications'
                : t('notifications.empty' as TranslationKey) || 'No notifications'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              {filter === 'unread'
                ? t('notifications.noUnreadDesc' as TranslationKey) || 'You have read all recent notifications.'
                : t('notifications.emptyDesc' as TranslationKey) || "We'll notify you when there are updates on your budgets or upcoming scheduled payments."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              onCloseParent={onCloseParent}
            />
          ))
        )}
      </div>
    </div>
  );
}
