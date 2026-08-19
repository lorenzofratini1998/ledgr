import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutUser } from '@/types/layout';
import { UpcomingDrawer } from './upcoming-drawer';
import { UserNavPopover } from './user-nav-popover';
import { NotificationCenter } from '@/features/notifications/components/notification-center';

interface TopHeaderProps {
  user: LayoutUser;
  upcomingSlot: React.ReactNode;
}

export function TopHeader({ user, upcomingSlot }: TopHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 left-0 right-0 w-full bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/85 border-b z-40 pt-safe shrink-0">
      <div className="flex items-center justify-between px-4 h-14">
        <UserNavPopover
          align="start"
          side="bottom"
          sideOffset={8}
          triggerRender={
            <button className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback>{user?.display_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-lg">Ledgr</span>
            </button>
          }
        />

        <div className="flex items-center gap-2">
          <UpcomingDrawer>
            {upcomingSlot}
          </UpcomingDrawer>
          
          <NotificationCenter variant="header" />
        </div>
      </div>
    </header>
  );
}

