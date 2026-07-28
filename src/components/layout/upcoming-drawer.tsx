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
import Link from 'next/link';

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
            <DrawerDescription>Your next scheduled transactions.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-4 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
          <DrawerFooter>
            <DrawerClose nativeButton={false} render={
              <Button className="w-full" render={<Link href="/scheduled" />} nativeButton={false} />
            }>
              View All Schedules
            </DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>
              Close
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
