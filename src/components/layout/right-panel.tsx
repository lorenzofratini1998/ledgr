'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CalendarClock, PanelRight, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface RightPanelProps {
  calendarSlot: ReactNode;
  upcomingSlot: ReactNode;
}

function PanelContent({ calendarSlot, upcomingSlot }: { calendarSlot: ReactNode, upcomingSlot: ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-background w-full shrink-0">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Calendar</h3>
        {calendarSlot}
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Upcoming</h3>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </div>
        {upcomingSlot}
      </div>
    </div>
  );
}

export function RightPanel({ calendarSlot, upcomingSlot }: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Persistent Panel (> 1280px) */}
      <aside className={`hidden xl:flex flex-col border-l bg-background transition-all duration-300 shrink-0 h-full overflow-hidden ${isCollapsed ? 'w-16' : 'w-80'}`}>
        
        {/* Header for toggling */}
        <div className="flex items-center justify-between p-4 h-[72px] shrink-0">
          {!isCollapsed && <span className="font-semibold text-lg">Schedule</span>}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mx-auto xl:mx-0 shrink-0 text-muted-foreground hover:text-foreground" 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
          </Button>
        </div>
        
        {!isCollapsed && <Separator />}

        {/* Content */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4 mt-6">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-primary/10" onClick={() => setIsCollapsed(false)} title="Open Schedule">
              <CalendarClock className="h-5 w-5 text-primary" />
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <PanelContent calendarSlot={calendarSlot} upcomingSlot={upcomingSlot} />
          </div>
        )}
      </aside>

      {/* Tablet Slide-out Sheet Trigger (768px - 1280px) */}
      <div className="hidden md:flex xl:hidden fixed right-6 bottom-6 z-40">
        <Sheet>
          <SheetTrigger render={<Button size="icon" className="rounded-full h-14 w-14 shadow-lg border border-border" />}>
            <PanelRightOpen className="h-6 w-6" />
            <span className="sr-only">Open Right Panel</span>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 border-l w-80 sm:max-w-[320px]" showCloseButton={false}>
            <PanelContent calendarSlot={calendarSlot} upcomingSlot={upcomingSlot} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
