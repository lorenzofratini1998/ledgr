'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Archive, Edit2, MoreVertical, RotateCcw, Star, Trash2 } from 'lucide-react';
import { useTranslation } from '@/i18n/hooks/use-translation';

interface WalletActionsProps {
  isActive: boolean;
  isDefault: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onUnarchive: () => void;
  onSetDefault: () => void;
}

export function WalletActions({
  isActive,
  isDefault,
  onEdit,
  onArchive,
  onDelete,
  onUnarchive,
  onSetDefault,
}: WalletActionsProps) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isActive ? (
          <>
            {!isDefault && (
              <DropdownMenuItem onClick={onSetDefault}>
                <Star className="mr-2 h-4 w-4" />
                <span>{t('wallets.setAsDefault')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>{t('wallets.edit')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive} className="text-destructive">
              <Archive className="mr-2 h-4 w-4" />
              <span>{t('wallets.archive')}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onUnarchive}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>{t('wallets.reactivate')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('wallets.deletePermanently')}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
