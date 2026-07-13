'use client';

import { useTransition, useState } from 'react';
import { Wallet, Currency } from '@/types/models';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { archiveWalletAction, setDefaultWalletAction, deleteWalletAction, unarchiveWalletAction } from '@/actions/wallets';
import { toast } from 'sonner';
import { MoreVertical, Edit2, Archive, Star, Trash2, RotateCcw, Wallet as DefaultWalletIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { WalletForm } from '@/components/wallets/wallet-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WALLET_COLOR_MAP, WALLET_ICON_MAP } from '@/components/wallets/config';

interface WalletCardProps {
  wallet: Wallet;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function WalletCard({ wallet, currencies, defaultCurrencyCode }: WalletCardProps) {
  const [isPending, startTransition] = useTransition();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleArchive = () => {
    startTransition(async () => {
      const response = await archiveWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || 'Wallet archived successfully');
        setIsArchiveOpen(false);
      } else {
        toast.error(response.message || 'Failed to archive wallet');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || 'Wallet deleted successfully');
        setIsDeleteOpen(false);
      } else {
        toast.error(response.message || 'Failed to delete wallet');
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      const response = await unarchiveWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || 'Wallet unarchived successfully');
      } else {
        toast.error(response.message || 'Failed to unarchive wallet');
      }
    });
  };

  const handleSetDefault = () => {
    startTransition(async () => {
      const response = await setDefaultWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || 'Default wallet updated');
      } else {
        toast.error(response.message || 'Failed to set default wallet');
      }
    });
  };

  const Icon = wallet.icon && WALLET_ICON_MAP[wallet.icon as keyof typeof WALLET_ICON_MAP]
    ? WALLET_ICON_MAP[wallet.icon as keyof typeof WALLET_ICON_MAP]
    : DefaultWalletIcon;

  const colorClass = wallet.color && WALLET_COLOR_MAP[wallet.color as keyof typeof WALLET_COLOR_MAP]
    ? WALLET_COLOR_MAP[wallet.color as keyof typeof WALLET_COLOR_MAP].cardStyle
    : 'bg-primary/10 text-primary';

  return (
    <Card className={cn('relative transition-all', isPending && 'opacity-50 pointer-events-none', wallet.is_default && 'border-primary ring-1 ring-primary')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className={cn("p-2 rounded-md", colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          {wallet.name}
          {wallet.is_default && (
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 ml-1" />
          )}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            {wallet.is_active ? (
              <>
                {!wallet.is_default && (
                  <DropdownMenuItem onClick={handleSetDefault}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Set as Default</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsArchiveOpen(true)} className="text-destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archive</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={handleUnarchive}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Reactivate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Permanently</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", !wallet.is_active && "text-muted-foreground")}>
          {formatCurrency(Number(wallet.initial_balance), wallet.currency_code)}
        </div>
      </CardContent>

      {/* Edit Sheet/Drawer */}
      {isDesktop ? (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Wallet</SheetTitle>
              <SheetDescription>
                Make changes to your wallet here.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8 mt-6 overflow-y-auto">
              <WalletForm
                currencies={currencies}
                defaultCurrencyCode={defaultCurrencyCode}
                initialData={wallet}
                onSuccess={() => setIsEditOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit Wallet</DrawerTitle>
              <DrawerDescription>
                Make changes to your wallet here.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8">
              <WalletForm
                currencies={currencies}
                defaultCurrencyCode={defaultCurrencyCode}
                initialData={wallet}
                onSuccess={() => setIsEditOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this wallet? It will be hidden from your active list, but all historical transactions and data will be preserved in your dashboard charts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your wallet
              <strong> {wallet.name} </strong> and all associated transactions. Your historical dashboard data will be permanently altered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
