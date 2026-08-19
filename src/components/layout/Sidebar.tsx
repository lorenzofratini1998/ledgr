'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { TranslationKey } from '@/i18n/types';
import { LayoutUser } from '@/types/layout';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { UserNavPopover } from './user-nav-popover';
import { NotificationCenter } from '@/features/notifications/components/notification-center';

interface SidebarProps {
  user: LayoutUser;
}

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();

  return (
    <aside className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 shrink-0 h-full relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`p-4 md:p-6 flex items-center justify-between`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`font-bold text-2xl text-primary ${!isCollapsed ? 'block' : 'hidden'}`}>Ledgr</span>
          <span className={`font-bold text-2xl text-primary ${!isCollapsed ? 'hidden' : 'block'}`}>L</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={isCollapsed ? (t(`navigation.${item.dictionaryKey}` as TranslationKey) || item.name) : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 mx-auto md:mx-0" />
              <span className={`font-medium whitespace-nowrap overflow-hidden transition-all ${isCollapsed ? 'hidden' : 'block'}`}>
                {t(`navigation.${item.dictionaryKey}` as TranslationKey) || item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3 flex flex-col gap-2">
        <NotificationCenter variant="sidebar" isCollapsed={isCollapsed} />

        <UserNavPopover
          side="right"
          sideOffset={16}
          triggerRender={
            <button className="w-full flex items-center gap-3 overflow-hidden rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer mt-2">
              <Avatar className="h-9 w-9 shrink-0 mx-auto md:mx-0">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback>{user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className={`flex-1 min-w-0 transition-all text-left ${isCollapsed ? 'hidden' : 'block'}`}>
                <p className="text-sm font-medium truncate">{user?.display_name || t('common.defaultUser')}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </button>
          }
        />
      </div>
    </aside>
  );
}

