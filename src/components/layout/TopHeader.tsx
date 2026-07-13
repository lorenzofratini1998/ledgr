import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { UpcomingDrawer } from './UpcomingDrawer';
import { LayoutUser } from '@/types/layout';
import { UserNavPopover } from './UserNavPopover';

interface TopHeaderProps {
  user: LayoutUser;
  upcomingSlot: React.ReactNode;
}

export function TopHeader({ user, upcomingSlot }: TopHeaderProps) {
  return (
    <header className="md:hidden w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b z-40 pt-safe shrink-0">
      <div className="flex items-center justify-between px-4 h-14">
        <UserNavPopover
          align="start"
          side="bottom"
          sideOffset={8}
          triggerRender={
            <button className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-lg">Ledgr</span>
            </button>
          }
        />

        <div className="flex items-center gap-2">
          <UpcomingDrawer>
            {upcomingSlot}
          </UpcomingDrawer>
          
          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" />}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
              <span className="sr-only">Notifications</span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  You have 2 unread messages.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
