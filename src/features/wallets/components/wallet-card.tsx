'use client';

import { ActionDialog } from '@/components/shared/action-dialog';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  archiveWalletAction,
  deleteWalletAction,
  setDefaultWalletAction,
  unarchiveWalletAction
} from '@/features/wallets/actions';
import { WalletForm } from '@/features/wallets/components/wallet-form';
import { WALLET_COLOR_MAP, WALLET_ICON_MAP } from '@/features/wallets/constants';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Currency, Wallet } from '@/types/models';
import { Wallet as DefaultWalletIcon, Star } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { WalletActions } from './wallet-actions';

interface WalletCardProps {
  wallet: Wallet;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function WalletCard({ wallet, currencies, defaultCurrencyCode }: WalletCardProps) {
  const [isPending, startTransition] = useTransition();

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
    <>
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
          <WalletActions
            isActive={wallet.is_active}
            isDefault={wallet.is_default}
            onEdit={() => setIsEditOpen(true)}
            onArchive={() => setIsArchiveOpen(true)}
            onDelete={() => setIsDeleteOpen(true)}
            onUnarchive={handleUnarchive}
            onSetDefault={handleSetDefault}
          />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", !wallet.is_active && "text-muted-foreground")}>
            {formatCurrency(Number(wallet.initial_balance), wallet.currency_code)}
          </div>
        </CardContent>
      </Card>

      {/* Edit Drawer */}
      <ResponsiveDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Wallet"
        description="Make changes to your wallet here."
      >
        <WalletForm
          currencies={currencies}
          defaultCurrencyCode={defaultCurrencyCode}
          initialData={wallet}
          onSuccess={() => setIsEditOpen(false)}
        />
      </ResponsiveDrawer>

      {/* Archive Dialog */}
      <ActionDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        title="Archive Wallet"
        description="Are you sure you want to archive this wallet? It will be hidden from your active list, but all historical transactions and data will be preserved in your dashboard charts."
        actionText="Archive"
        onAction={handleArchive}
        isPending={isPending}
      />

      {/* Delete Dialog */}
      <ActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Permanently"
        description={
          <>
            This action cannot be undone. This will permanently delete your wallet
            <strong> {wallet.name} </strong> and all associated transactions. Your historical dashboard data will be permanently altered.
          </>
        }
        actionText="Delete"
        onAction={handleDelete}
        isPending={isPending}
        destructive={true}
      />
    </>
  );
}
