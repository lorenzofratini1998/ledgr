'use client';

import { ActionDialog } from '@/components/shared/action-dialog';
import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Wallet as DefaultWalletIcon, Star, EyeOff } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { WalletActions } from './wallet-actions';

interface WalletCardProps {
  wallet: Wallet;
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function WalletCard({ wallet, currencies, defaultCurrencyCode }: WalletCardProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleArchive = () => {
    startTransition(async () => {
      const response = await archiveWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || t('wallets.archiveSuccess'));
        setIsArchiveOpen(false);
      } else {
        toast.error(response.message || t('wallets.archiveError'));
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || t('wallets.deleteSuccess'));
        setIsDeleteOpen(false);
      } else {
        toast.error(response.message || t('wallets.deleteError'));
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      const response = await unarchiveWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || t('wallets.unarchiveSuccess'));
      } else {
        toast.error(response.message || t('wallets.unarchiveError'));
      }
    });
  };

  const handleSetDefault = () => {
    startTransition(async () => {
      const response = await setDefaultWalletAction(wallet.id);
      if (response.success) {
        toast.success(response.message || t('wallets.setDefaultSuccess'));
      } else {
        toast.error(response.message || t('wallets.setDefaultError'));
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
            {wallet.exclude_from_net_worth && (
              <div title="Excluded from Net Worth" className="flex items-center justify-center p-1 bg-muted rounded-full ml-1">
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
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
        title={t('wallets.editWallet')}
        description={t('wallets.editWalletDescription')}
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
        title={t('wallets.archiveWallet')}
        description={t('wallets.archivePrompt')}
        actionText={t('wallets.archiveAction')}
        onAction={handleArchive}
        isPending={isPending}
      />

      {/* Delete Dialog */}
      <ActionDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteConfirmation('');
        }}
        title={t('wallets.deletePermanently')}
        description={
          <>
            {t('wallets.deletePrompt1')}
            <strong> {wallet.name} </strong> 
            {t('wallets.deletePrompt2')}
          </>
        }
        actionText={t('wallets.deleteAction')}
        onAction={handleDelete}
        isPending={isPending}
        destructive={true}
        actionDisabled={deleteConfirmation !== wallet.name}
      >
        <div className="pt-2">
          <label className="text-sm font-medium mb-2 block">
            {t('wallets.typeToConfirm')} <strong>{wallet.name}</strong> {t('wallets.toConfirm')}
          </label>
          <Input 
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={wallet.name}
            className="mt-1"
          />
        </div>
      </ActionDialog>
    </>
  );
}
