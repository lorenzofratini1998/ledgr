"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TransactionRow } from "./data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<TransactionRow>[] = [
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
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.getValue("date") as string;
      return <div className="text-muted-foreground whitespace-nowrap">{new Date(dateStr).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const tx = row.original;
      return (
        <div className="min-w-[150px]">
          <p className="font-medium">{tx.description}</p>
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
    header: "Category",
    cell: ({ row }) => {
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
    header: "Wallet",
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
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row, table }) => {
      const amount = parseFloat(row.getValue("amount"));
      const normalizedAmount = parseFloat(row.original.normalized_amount as unknown as string);
      const currency = row.original.currency_code;
      const primaryCurrencyCode = (table.options.meta as any)?.primaryCurrencyCode;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(Math.abs(amount));

      const isConverted = amount !== normalizedAmount && primaryCurrencyCode;
      const formattedNormalized = isConverted ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: primaryCurrencyCode,
      }).format(Math.abs(normalizedAmount)) : null;

      return (
        <div className="flex flex-col items-end">
          <div className={`text-right font-medium whitespace-nowrap ${amount > 0 ? "text-emerald-500" : "text-foreground"}`}>
            {amount > 0 ? "+" : "-"}{formatted}
          </div>
          {isConverted && (
            <div className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
              ≈ {amount > 0 ? "+" : "-"}{formattedNormalized}
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
            <DropdownMenuItem onClick={() => meta?.onEdit?.(tx)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => meta?.onDelete?.(tx)}
              className="text-red-600 focus:bg-red-500/10 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
