import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { CalendarClock } from 'lucide-react';
import { ReactNode } from 'react';

interface UpcomingDrawerProps {
  children: ReactNode;
}

export function UpcomingDrawer({ children }: UpcomingDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" />}>
        <CalendarClock className="h-5 w-5" />
        <span className="sr-only">Upcoming Payments</span>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Upcoming Payments</DrawerTitle>
            <DrawerDescription>Your scheduled transactions for the next 7 days.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            {children}
          </div>
          <DrawerFooter>
            <Button className="w-full">View All Schedules</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
