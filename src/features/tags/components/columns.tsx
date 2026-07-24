"use client";

import { ColumnDef } from "@tanstack/react-table";
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
import { Tag } from "@/types/models";
import { TAG_COLOR_MAP, TagColor } from "../constants";

export type TagRow = Tag;

export const columns: ColumnDef<TagRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          (table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false) as any
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "tag_name",
    header: "Name",
    cell: ({ row }) => {
      const tag = row.original;
      const colorClass = tag.color && TAG_COLOR_MAP[tag.color as TagColor] 
        ? TAG_COLOR_MAP[tag.color as TagColor].text 
        : "";
      const bgClass = tag.color && TAG_COLOR_MAP[tag.color as TagColor]
        ? TAG_COLOR_MAP[tag.color as TagColor].bg.replace('bg-', 'border-').replace('500', '200')
        : "";

      return (
        <div className="flex items-center gap-2 font-medium">
          <Badge 
            variant="outline" 
            className={`text-xs h-6 font-normal bg-background/50 ${colorClass} ${bgClass}`}
          >
            {tag.tag_name}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "tag_description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.tag_description;
      return (
        <span className="text-muted-foreground text-sm line-clamp-1 max-w-[300px]">
          {desc || "-"}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const tag = row.original;
      const meta = table.options.meta as any;

      return (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => meta?.onEdit?.(tag)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => meta?.onDelete?.(tag)} className="text-red-600 focus:bg-red-500/10 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
