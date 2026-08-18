"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TransactionRow } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/hooks/use-translation";
import { formatDate, formatCurrency } from "@/lib/formatters";

export const useColumns = (): ColumnDef<TransactionRow>[] => {
  const { t } = useTranslation();
  
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() as boolean}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: t('common.date'),
    cell: ({ row, table }) => {
      const dateStr = row.getValue("date") as string;
      const dateFormatPreference = (table.options.meta as any)?.dateFormatPreference;
      return <div className="text-muted-foreground whitespace-nowrap">{formatDate(dateStr, dateFormatPreference)}</div>;
    },
  },
  {
    accessorKey: "description",
    header: t('common.description'),
    cell: ({ row }) => {
      const tx = row.original;
      return (
        <div className="min-w-[150px]">
          <p className="font-medium flex items-center gap-2">
            {tx.description}
            {(tx as any).status === 'pending' && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {tx.transactions_tags.map(tt => (
              <Badge 
                key={tt.tags.tag_id} 
                variant="outline" 
                className="text-[10px] h-5 px-1.5 font-normal bg-background/50"
                style={tt.tags.color ? { borderColor: tt.tags.color, color: tt.tags.color } : {}}
              >
                {tt.tags.tag_name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "category",
    header: t('categories.title'),
    cell: ({ row }) => {
      const isTransfer = !!row.original.transfer_id;
      if (isTransfer) {
        return (
          <Badge 
            variant="outline" 
            className="font-medium text-xs rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1 w-fit"
          >
            {t('transactions.transfer')}
          </Badge>
        );
      }

      const cat = row.original.categories;
      if (!cat) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge 
          variant="secondary" 
          className="font-medium text-xs rounded-md shadow-none" 
          style={cat.color ? { backgroundColor: `${cat.color}20`, color: cat.color } : {}}
        >
          {cat.category_name}
        </Badge>
      );
    }
  },
  {
    accessorKey: "wallet",
    header: t('common.wallet'),
    cell: ({ row }) => {
      const wallet = row.original.wallets;
      if (!wallet) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge 
          variant="outline" 
          className="font-medium text-xs rounded-md bg-background" 
          style={wallet.color ? { borderColor: wallet.color, color: wallet.color } : {}}
        >
          {wallet.name}
        </Badge>
      );
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">{t('common.amount')}</div>,
    cell: ({ row, table }) => {
      const isTransfer = !!row.original.transfer_id;
      const amount = parseFloat(row.getValue("amount"));
      const normalizedAmount = parseFloat(row.original.normalized_amount as unknown as string);
      const currency = row.original.currency_code;
      const primaryCurrencyCode = (table.options.meta as any)?.primaryCurrencyCode;
      const locale = (table.options.meta as any)?.locale || 'en-US';

      const formatted = formatCurrency(Math.abs(amount), currency, locale);

      const isConverted = amount !== normalizedAmount && primaryCurrencyCode;
      const formattedNormalized = isConverted ? formatCurrency(Math.abs(normalizedAmount), primaryCurrencyCode, locale) : null;

      const amountColor = isTransfer
        ? "text-blue-600 dark:text-blue-400"
        : amount > 0
        ? "text-emerald-500"
        : "text-foreground";

      const amountPrefix = isTransfer ? "⇄ " : amount > 0 ? "+" : "-";

      return (
        <div className="flex flex-col items-end">
          <div className={`text-right font-medium whitespace-nowrap ${amountColor}`}>
            {amountPrefix}{formatted}
          </div>
          {isConverted && (
            <div className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
              ≈ {amountPrefix}{formattedNormalized}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const tx = row.original;
      const meta = table.options.meta as any;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            {(tx as any).status === 'pending' && (
              <DropdownMenuItem onClick={() => meta?.onConfirm?.(tx)} className="text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-600">
                <Check className="mr-2 h-4 w-4" />
                Confirm Amount
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => meta?.onEdit?.(tx)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => meta?.onDelete?.(tx)}
              className="text-red-600 focus:bg-red-500/10 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
};
