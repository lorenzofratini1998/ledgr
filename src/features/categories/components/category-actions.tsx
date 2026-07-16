"use client";

import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Archive, Trash2, RotateCcw } from 'lucide-react';
import { useDictionary } from '@/i18n/dictionary-provider';

interface CategoryActionsProps {
  isActive: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onUnarchive: () => void;
}

export function CategoryActions({
  isActive,
  onEdit,
  onArchive,
  onDelete,
  onUnarchive,
}: CategoryActionsProps) {
  const dictionary = useDictionary();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isActive ? (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              {dictionary.common.edit}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive} className="text-destructive">
              <Archive className="mr-2 h-4 w-4" />
              {dictionary.categories.archiveAction}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={onUnarchive}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {dictionary.categories.reactivate}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {dictionary.common.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
