"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActionDialog } from "@/components/shared/action-dialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { deleteTagAction, bulkDeleteTagsAction } from "../actions";
import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { DataGrid } from "@/components/shared/data-grid/data-grid";
import { DataGridPagination } from "@/components/shared/data-grid/data-grid-pagination";
import { TagForm } from "./tag-form";
import { Badge } from "@/components/ui/badge";
import { TAG_COLOR_MAP, TagColor } from "../constants";

export type TagRow = any;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  currentPage?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount = 0,
  currentPage = 1,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [rowSelection, setRowSelection] = useState({});
  const [editTag, setEditTag] = useState<TagRow | null>(null);
  const [deleteTag, setDeleteTag] = useState<TagRow | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Sync search term from URL
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams.get("search")]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams.toString());
      const oldSearch = currentParams.get("search") || "";
      if (searchTerm === oldSearch) return;

      if (searchTerm) {
        currentParams.set("search", searchTerm);
      } else {
        currentParams.delete("search");
      }
      currentParams.set("page", "1");
      
      startTransition(() => {
        router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    });
  };

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row: any) => row.tag_id,
    meta: {
      onEdit: setEditTag,
      onDelete: setDeleteTag,
    }
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2 max-w-sm">
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full bg-background"
          />
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="flex items-center space-x-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 font-semibold animate-in fade-in zoom-in duration-200"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {Object.keys(rowSelection).length}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <DataGrid 
        table={table}
        columnsLength={columns.length}
        isPending={isPending}
        noResultsMessage="No tags found."
        renderMobileItem={(tag) => {
          const typedTag = tag as unknown as TagRow;
          const colorClass = typedTag.color && TAG_COLOR_MAP[typedTag.color as TagColor] 
            ? TAG_COLOR_MAP[typedTag.color as TagColor].text 
            : "";
          const bgClass = typedTag.color && TAG_COLOR_MAP[typedTag.color as TagColor]
            ? TAG_COLOR_MAP[typedTag.color as TagColor].bg.replace('bg-', 'border-').replace('500', '200')
            : "";

          return (
            <div className="p-4 rounded-xl border bg-card flex items-start gap-3 shadow-sm">
              <div className="pt-1 shrink-0">
                <Checkbox
                  checked={table.getRowModel().rows.find(r => r.original === tag)?.getIsSelected()}
                  onCheckedChange={(value) => table.getRowModel().rows.find(r => r.original === tag)?.toggleSelected(!!value)}
                  aria-label="Select row"
                />
              </div>
              
              <div className="flex-1 flex justify-between items-start gap-2">
                <div className="flex flex-col space-y-1">
                  <div className="font-medium">
                    <Badge 
                      variant="outline" 
                      className={`text-xs h-6 font-normal bg-background/50 ${colorClass} ${bgClass}`}
                    >
                      {typedTag.tag_name}
                    </Badge>
                  </div>
                  {typedTag.tag_description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {typedTag.tag_description}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTag(typedTag)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteTag(typedTag)} className="text-red-600 focus:bg-red-500/10 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        }}
      />

      <div className="md:hidden">
        <DataGridPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>

      {/* Desktop Pagination Controls */}
      <div className="hidden md:flex items-center justify-between px-2 pt-4">
        <div className="text-sm text-muted-foreground flex items-center">
          Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </div>
        <DataGridPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>

      {/* Edit Drawer */}
      <ResponsiveDrawer
        open={!!editTag}
        onOpenChange={(open) => !open && setEditTag(null)}
        title="Edit Tag"
        description="Modify the details of your tag."
      >
        {editTag && (
          <TagForm 
            initialData={{
              tag_id: editTag.tag_id,
              tag_name: editTag.tag_name,
              tag_description: editTag.tag_description,
              color: editTag.color,
              icon: editTag.icon,
            }}
            onSuccess={() => setEditTag(null)}
          />
        )}
      </ResponsiveDrawer>

      {/* Delete Single Dialog */}
      <ActionDialog
        open={!!deleteTag}
        onOpenChange={(open) => !open && setDeleteTag(null)}
        title="Are you absolutely sure?"
        description="This will permanently delete this tag. Any transactions associated with this tag will NOT be deleted, but the tag label will be removed from them."
        actionText="Delete Tag"
        destructive={true}
        isPending={isPending}
        onAction={() => {
          if (deleteTag) {
            startTransition(async () => {
              const res = await deleteTagAction(deleteTag.tag_id);
              if (res.success) {
                toast.success(res.message);
                setRowSelection(prev => {
                  const newSelection = { ...prev };
                  delete (newSelection as any)[deleteTag.tag_id];
                  return newSelection;
                });
                setDeleteTag(null);
              } else {
                toast.error(res.message);
              }
            });
          }
        }}
      />

      {/* Bulk Delete Dialog */}
      <ActionDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete multiple tags"
        description={`Are you sure you want to delete ${Object.keys(rowSelection).length} tags? Transactions associated with these tags will remain intact.`}
        actionText="Delete Tags"
        destructive={true}
        isPending={isPending}
        onAction={() => {
          const idsToDelete = Object.keys(rowSelection);
          startTransition(async () => {
            const res = await bulkDeleteTagsAction(idsToDelete);
            if (res.success) {
              toast.success(res.message);
              setRowSelection({});
              setBulkDeleteDialogOpen(false);
            } else {
              toast.error(res.message);
            }
          });
        }}
      />
    </div>
  );
}
