'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Archive, Edit2, MoreVertical, RotateCcw, Star, Trash2 } from 'lucide-react';

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      } />
      <DropdownMenuContent align="end">
        {isActive ? (
          <>
            {!isDefault && (
              <DropdownMenuItem onClick={onSetDefault}>
                <Star className="mr-2 h-4 w-4" />
                <span>Set as Default</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive} className="text-destructive">
              <Archive className="mr-2 h-4 w-4" />
              <span>Archive</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onUnarchive}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Reactivate</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Permanently</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
