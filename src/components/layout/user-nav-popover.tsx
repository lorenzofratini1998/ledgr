'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { LogOut, User as UserIcon } from 'lucide-react';
import { ReactElement } from 'react';

interface UserNavPopoverProps {
  triggerRender: ReactElement;
  align?: "center" | "end" | "start";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export function UserNavPopover({ triggerRender, align = "end", side = "right", sideOffset = 16 }: UserNavPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger render={triggerRender} />
      <PopoverContent align={align} side={side} sideOffset={sideOffset} className="w-56 p-1">
        <div className="px-2 py-1.5 text-sm font-medium">My Account</div>
        <Separator className="my-1" />
        <Button variant="ghost" className="w-full justify-start h-9 px-2 font-normal">
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start h-9 px-2 font-normal text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
