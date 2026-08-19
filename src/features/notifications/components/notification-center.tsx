'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/use-notifications';
import { NotificationList } from './notification-list';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';

interface NotificationCenterProps {
  variant?: 'sidebar' | 'header';
  isCollapsed?: boolean;
}

export function NotificationCenter({
  variant = 'header',
  isCollapsed = false,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();

  const title = t('notifications.title' as TranslationKey) || 'Notifications';
  const description = t('notifications.description' as TranslationKey) || 'Notifications center and budget alerts';

  // Desktop Popover Implementation
  if (isDesktop) {
    if (variant === 'sidebar') {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative group"
                title={isCollapsed ? title : undefined}
              />
            }
          >
            <div className="relative mx-auto md:mx-0 shrink-0">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`font-medium whitespace-nowrap overflow-hidden transition-all text-left flex-1 flex items-center justify-between ${
                isCollapsed ? 'hidden' : 'flex'
              }`}
            >
              <span>{title}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary/15 text-primary text-xs font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </span>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="right"
            sideOffset={16}
            className="w-[380px] p-0 shadow-2xl rounded-2xl border-border/60 overflow-hidden"
          >
            <NotificationList onCloseParent={() => setOpen(false)} />
          </PopoverContent>
        </Popover>
      );
    }

    // Desktop Header
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
            />
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">{title}</span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[380px] p-0 shadow-2xl rounded-2xl border-border/60 overflow-hidden"
        >
          <NotificationList onCloseParent={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile / Tablet Drawer Implementation
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">{title}</span>
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
      >
        <div className="-mx-4 -mb-8">
          <NotificationList onCloseParent={() => setOpen(false)} />
        </div>
      </ResponsiveDrawer>
    </>
  );
}
