'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { WalletForm } from '@/components/wallets/wallet-form';
import { Currency } from '@/types/models';

interface CreateWalletDrawerProps {
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function CreateWalletDrawer({ currencies, defaultCurrencyCode }: CreateWalletDrawerProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleSuccess = () => {
    setOpen(false);
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        } />
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create Wallet</SheetTitle>
            <SheetDescription>
              Add a new wallet to track your finances.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8 mt-6 overflow-y-auto">
            <WalletForm currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} onSuccess={handleSuccess} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={
        <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 md:hidden z-50">
          <Plus className="h-6 w-6" />
        </Button>
      } />
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Wallet</DrawerTitle>
          <DrawerDescription>
            Add a new wallet to track your finances.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <WalletForm currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} onSuccess={handleSuccess} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
