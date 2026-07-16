import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  cancelText?: string;
  actionText: string;
  onAction: () => void;
  isPending?: boolean;
  destructive?: boolean;
}

export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText,
  onAction,
  isPending = false,
  destructive = false,
}: ActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={destructive ? 'text-destructive' : ''}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onAction();
            }}
            disabled={isPending}
            className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
