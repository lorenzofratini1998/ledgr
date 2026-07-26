'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings as SettingsIcon, Hash } from 'lucide-react';
import { ReactElement } from 'react';
import { useLogout } from '@/hooks/use-logout';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/hooks/use-translation';

interface UserNavPopoverProps {
  triggerRender: ReactElement;
  align?: "center" | "end" | "start";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export function UserNavPopover({ triggerRender, align = "end", side = "right", sideOffset = 16 }: UserNavPopoverProps) {
  const { logout, isPending } = useLogout();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger render={triggerRender} />
      <PopoverContent align={align} side={side} sideOffset={sideOffset} className="w-56 p-1">
        <div className="px-2 py-1.5 text-sm font-medium">{t('navigation.settings') || "My Account"}</div>
        <Separator className="my-1" />
        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-2 font-normal"
          onClick={() => router.push('/settings')}
        >
          <SettingsIcon className="mr-2 h-4 w-4" />
          {t('navigation.settings')}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-2 font-normal md:hidden"
          onClick={() => router.push('/tags')}
        >
          <Hash className="mr-2 h-4 w-4" />
          {t('navigation.tags')}
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start h-9 px-2 font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
          disabled={isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isPending ? '...' : t('settings.security.logout')}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
