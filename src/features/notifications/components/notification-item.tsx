'use client';

import { Notification } from '@/types/models';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CalendarClock, Bell, Check, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onCloseParent?: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onCloseParent,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const notificationData = typeof notification.data === 'object' && notification.data !== null
    ? (notification.data as Record<string, unknown>)
    : {};
  const targetUrl = typeof notificationData.target_url === 'string' ? notificationData.target_url : undefined;

  // Resolve dynamic localized title and message with database fallback
  const getLocalizedContent = () => {
    const params = notificationData as Record<string, string | number>;

    if (notification.type === 'budget_exceeded') {
      const translatedTitle = t('notifications.budgetExceededTitle' as TranslationKey);
      const translatedMsg = t('notifications.budgetExceededDesc' as TranslationKey, params);
      return {
        title: translatedTitle !== 'notifications.budgetExceededTitle' ? translatedTitle : notification.title,
        message: translatedMsg !== 'notifications.budgetExceededDesc' ? translatedMsg : notification.message,
      };
    }
    if (notification.type === 'budget_warning') {
      const translatedTitle = t('notifications.budgetWarningTitle' as TranslationKey);
      const translatedMsg = t('notifications.budgetWarningDesc' as TranslationKey, params);
      return {
        title: translatedTitle !== 'notifications.budgetWarningTitle' ? translatedTitle : notification.title,
        message: translatedMsg !== 'notifications.budgetWarningDesc' ? translatedMsg : notification.message,
      };
    }
    if (notification.type === 'recurring_reminder') {
      const translatedTitle = t('notifications.recurringReminderTitle' as TranslationKey);
      const translatedMsg = t('notifications.recurringReminderDesc' as TranslationKey, params);
      return {
        title: translatedTitle !== 'notifications.recurringReminderTitle' ? translatedTitle : notification.title,
        message: translatedMsg !== 'notifications.recurringReminderDesc' ? translatedMsg : notification.message,
      };
    }

    return {
      title: notification.title,
      message: notification.message,
    };
  };

  const { title, message } = getLocalizedContent();

  // Icon & Style configuration by notification type
  const getTypeConfig = () => {
    switch (notification.type) {
      case 'budget_exceeded':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-destructive/15 text-destructive',
          borderColor: 'border-destructive/30',
        };
      case 'budget_warning':
        return {
          icon: AlertCircle,
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-500/30',
        };
      case 'recurring_reminder':
        return {
          icon: CalendarClock,
          iconBg: 'bg-primary/15 text-primary',
          borderColor: 'border-primary/30',
        };
      case 'system':
      default:
        return {
          icon: Bell,
          iconBg: 'bg-muted text-muted-foreground',
          borderColor: 'border-border',
        };
    }
  };

  const { icon: Icon, iconBg } = getTypeConfig();

  const formattedTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  const content = (
    <div
      className={cn(
        'group relative flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 border',
        notification.is_read
          ? 'bg-card/50 hover:bg-card border-transparent'
          : 'bg-accent/40 hover:bg-accent/60 border-primary/15 shadow-sm'
      )}
    >
      {/* Icon */}
      <div className={cn('p-2.5 rounded-xl shrink-0 mt-0.5', iconBg)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold truncate', !notification.is_read && 'text-foreground font-bold')}>
            {title}
          </p>
          {!notification.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {message}
        </p>
        <span className="text-[11px] text-muted-foreground/70 mt-1.5 block font-medium">
          {formattedTime}
        </span>
      </div>

      {/* Quick Action Buttons (Show on hover or always accessible) */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title={t('notifications.markAsRead' as TranslationKey) || 'Mark as read'}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title={t('notifications.delete' as TranslationKey) || 'Delete'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (targetUrl) {
    return (
      <Link
        href={targetUrl}
        onClick={() => {
          if (!notification.is_read) {
            onMarkAsRead(notification.id);
          }
          if (onCloseParent) {
            onCloseParent();
          }
        }}
        className="block no-underline"
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}
