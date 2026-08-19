import { LayoutUser } from '@/types/layout';
import { ReactNode } from 'react';
import { BottomNav } from './bottom-nav';
import { RightPanel } from './right-panel';
import { Sidebar } from './sidebar';
import { TopHeader } from './top-header';
import { RealtimeNotificationListener } from '@/features/notifications';

interface ShellProps {
  children: ReactNode;
  user: LayoutUser;
  calendarSlot: ReactNode;
  upcomingSlot: ReactNode;
}

export function Shell({ children, user, calendarSlot, upcomingSlot }: ShellProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
      <RealtimeNotificationListener />

      
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col w-full h-full">
        <TopHeader user={user} upcomingSlot={upcomingSlot} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        <Sidebar user={user} />
        
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="h-full flex flex-col max-w-7xl mx-auto w-full relative">
            {children}
          </div>
        </main>
        
        <RightPanel calendarSlot={calendarSlot} upcomingSlot={upcomingSlot} />
      </div>

    </div>
  );
}
