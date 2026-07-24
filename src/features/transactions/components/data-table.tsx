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
import { Transaction } from "@/types/models";
import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Filter, Check, ChevronsUpDown, Trash2, MoreHorizontal, Pencil } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteTransactionAction, bulkDeleteTransactionsAction } from "../actions";
import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { TransactionForm } from "./transaction-form";

import { ActionDialog } from "@/components/shared/action-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter
} from "@/components/ui/drawer";

// Define the shape of our row based on the query result
export type TransactionRow = Transaction & {
  wallets: { name: string; currency_code: string; color: string | null; icon: string | null } | null;
  categories: { category_name: string; color: string | null; icon: string | null } | null;
  transactions_tags: { tags: { tag_id: string; tag_name: string; color: string | null } }[];
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  currentPage?: number;
  wallets?: any[];
  categories?: any[];
  tags?: any[];
  currencies?: any[];
  primaryCurrencyCode?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount = 0,
  currentPage = 1,
  wallets = [],
  categories = [],
  tags = [],
  currencies = [],
  primaryCurrencyCode = "EUR"
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [rowSelection, setRowSelection] = useState({});
  const [editTransaction, setEditTransaction] = useState<TransactionRow | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<TransactionRow | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // No local state for transactions needed anymore since we use compact pagination
  const [localFilters, setLocalFilters] = useState({
    wallets: searchParams.get("wallets") ? searchParams.get("wallets")!.split(",") : [],
    categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",") : [],
    tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
    currencies: searchParams.get("currencies") ? searchParams.get("currencies")!.split(",") : [],
    datePreset: "custom",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    minAmount: searchParams.get("minAmount") || "",
    maxAmount: searchParams.get("maxAmount") || "",
    type: (searchParams.get("type") as 'income' | 'expense' | 'all') || 'all',
  });

  // Sync search term from URL (only when URL search param actually changes externally)
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams.get("search")]);

  // Sync local filters when opening the sheet/drawer
  useEffect(() => {
    if (open) {
      setLocalFilters({
        wallets: searchParams.get("wallets") ? searchParams.get("wallets")!.split(",") : [],
        categories: searchParams.get("categories") ? searchParams.get("categories")!.split(",") : [],
        tags: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
        currencies: searchParams.get("currencies") ? searchParams.get("currencies")!.split(",") : [],
        datePreset: "custom",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        minAmount: searchParams.get("minAmount") || "",
        maxAmount: searchParams.get("maxAmount") || "",
        type: (searchParams.get("type") as 'income' | 'expense' | 'all') || 'all',
      });
    }
  }, [open, searchParams]);

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

  const handleApplyFilters = () => {
    const currentParams = new URLSearchParams(window.location.search);
    
    const setOrDeleteArray = (key: string, arr: string[]) => {
      if (arr.length > 0) {
        currentParams.set(key, arr.join(","));
      } else {
        currentParams.delete(key);
      }
    };

    const setOrDeleteString = (key: string, value: string) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    };

    setOrDeleteArray("wallets", localFilters.wallets);
    setOrDeleteArray("categories", localFilters.categories);
    setOrDeleteArray("tags", localFilters.tags);
    setOrDeleteArray("currencies", localFilters.currencies);
    setOrDeleteString("startDate", localFilters.startDate);
    setOrDeleteString("endDate", localFilters.endDate);
    setOrDeleteString("minAmount", localFilters.minAmount);
    setOrDeleteString("maxAmount", localFilters.maxAmount);
    setOrDeleteString("type", localFilters.type !== 'all' ? localFilters.type : "");

    currentParams.set("page", "1");
    
    setOpen(false);
    startTransition(() => {
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    setLocalFilters({
      wallets: [],
      categories: [],
      tags: [],
      currencies: [],
      datePreset: "custom",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      type: "all",
    });
  };

  const handlePageChange = (newPage: number) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    });
  };



  const toggleArrayItem = (key: 'wallets' | 'categories' | 'tags' | 'currencies', id: string) => {
    setLocalFilters(prev => {
      const arr = prev[key];
      if (arr.includes(id)) {
        return { ...prev, [key]: arr.filter(i => i !== id) };
      } else {
        return { ...prev, [key]: [...arr, id] };
      }
    });
  };

  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let start = "";
    let end = "";
    
    if (preset === "this-month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    } else if (preset === "last-month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    } else if (preset === "this-year") {
      start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      end = new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0];
    }

    setLocalFilters(prev => ({
      ...prev,
      datePreset: preset,
      startDate: start,
      endDate: end
    }));
  };

  const activeFilterCount = [
    searchParams.get("wallets"),
    searchParams.get("categories"),
    searchParams.get("tags"),
    searchParams.get("currencies"),
    searchParams.get("startDate"),
    searchParams.get("endDate"),
    searchParams.get("minAmount"),
    searchParams.get("maxAmount"),
    searchParams.get("type") && searchParams.get("type") !== "all",
  ].filter(Boolean).length;

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
    getRowId: (row: any) => row.transaction_id,
    meta: {
      onEdit: setEditTransaction,
      onDelete: setDeleteTransaction,
      primaryCurrencyCode: primaryCurrencyCode
    }
  });

  const MultiSelect = ({
    title,
    options,
    selectedValues,
    onToggle
  }: {
    title: string;
    options: { label: string; value: string }[];
    selectedValues: string[];
    onToggle: (value: string) => void;
  }) => {
    const [localOpen, setLocalOpen] = useState(false);
    const selectedLabels = selectedValues.map(v => options.find(o => o.value === v)?.label).filter(Boolean);

    return (
      <Popover open={localOpen} onOpenChange={setLocalOpen}>
        <PopoverTrigger render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={localOpen}
            className="w-full justify-between h-auto min-h-9 px-3 py-1.5"
          >
            <div className="flex flex-wrap gap-1 items-center max-w-[90%] overflow-hidden">
              {selectedLabels.length === 0 && <span className="text-muted-foreground font-normal">Select {title}...</span>}
              {selectedLabels.map(label => (
                <Badge variant="secondary" key={label} className="mr-1 text-xs px-1.5 py-0 font-normal">
                  {label}
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        } />
        <PopoverContent className="w-[var(--anchor-width)] min-w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${title}...`} />
            <CommandList>
              <CommandEmpty>No {title} found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => onToggle(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const FilterForm = () => {
    const selectedCurrencySymbol = localFilters.currencies.length === 1 
      ? currencies.find(c => c.iso_code === localFilters.currencies[0])?.symbol || null
      : null;

    const handleAmountBlur = (field: 'minAmount' | 'maxAmount') => {
      setLocalFilters(prev => {
        const val = prev[field];
        if (!val) return prev;
        const parsed = parseFloat(val);
        if (isNaN(parsed)) return prev;
        return { ...prev, [field]: parsed.toFixed(2) };
      });
    };
    return (
      <div className="py-4 px-4 sm:px-2 space-y-6">
        
        {/* Transaction Type */}
        <div className="space-y-3">
          <Label>Transaction Type</Label>
          <div className="flex bg-muted p-1 rounded-lg w-full items-center">
            <button
              className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setLocalFilters(p => ({ ...p, type: 'all' }))}
            >
              All
            </button>
            <button
              className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'income' ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setLocalFilters(p => ({ ...p, type: 'income' }))}
            >
              Income
            </button>
            <button
              className={cn("flex-1 py-1.5 text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'expense' ? "bg-background shadow-sm text-rose-500" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setLocalFilters(p => ({ ...p, type: 'expense' }))}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label>Date Range</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant={localFilters.datePreset === 'this-month' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => applyDatePreset('this-month')}>This Month</Badge>
            <Badge variant={localFilters.datePreset === 'last-month' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => applyDatePreset('last-month')}>Last Month</Badge>
            <Badge variant={localFilters.datePreset === 'this-year' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => applyDatePreset('this-year')}>This Year</Badge>
            <Badge variant={localFilters.datePreset === 'custom' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setLocalFilters(p => ({ ...p, datePreset: 'custom' }))}>Custom</Badge>
          </div>
          
          {localFilters.datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Input 
                  type="date" 
                  value={localFilters.startDate}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="block w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Input 
                  type="date" 
                  value={localFilters.endDate}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="block w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-3">
          <Label>Currency</Label>
          <MultiSelect 
            title="currencies"
            options={currencies.map(c => ({ label: `${c.iso_code} - ${c.name}`, value: c.iso_code }))}
            selectedValues={localFilters.currencies}
            onToggle={(val) => toggleArrayItem("currencies", val)}
          />
        </div>

        {/* Amount Range */}
        <div className="space-y-3">
          <Label>Amount Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min Amount</Label>
              <div className="relative">
                {selectedCurrencySymbol && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    {selectedCurrencySymbol}
                  </div>
                )}
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={localFilters.minAmount}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.includes('.')) {
                      const parts = val.split('.');
                      if (parts[1].length > 2) {
                        val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                      }
                    }
                    setLocalFilters(prev => ({ ...prev, minAmount: val }));
                  }}
                  onBlur={() => handleAmountBlur('minAmount')}
                  className={cn("text-lg font-medium", selectedCurrencySymbol ? "pl-8" : "")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Max Amount</Label>
              <div className="relative">
                {selectedCurrencySymbol && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                    {selectedCurrencySymbol}
                  </div>
                )}
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={localFilters.maxAmount}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.includes('.')) {
                      const parts = val.split('.');
                      if (parts[1].length > 2) {
                        val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                      }
                    }
                    setLocalFilters(prev => ({ ...prev, maxAmount: val }));
                  }}
                  onBlur={() => handleAmountBlur('maxAmount')}
                  className={cn("text-lg font-medium", selectedCurrencySymbol ? "pl-8" : "")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wallets */}
        <div className="space-y-3">
          <Label>Wallets</Label>
          <MultiSelect 
            title="wallets"
            options={wallets.map(w => ({ label: w.name, value: w.id }))}
            selectedValues={localFilters.wallets}
            onToggle={(val) => toggleArrayItem("wallets", val)}
          />
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <MultiSelect 
            title="categories"
            options={categories.map(c => ({ label: c.category_name, value: c.category_id }))}
            selectedValues={localFilters.categories}
            onToggle={(val) => toggleArrayItem("categories", val)}
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="space-y-3">
            <Label>Tags</Label>
            <MultiSelect 
              title="tags"
              options={tags.map(t => ({ label: t.tag_name, value: t.tag_id }))}
              selectedValues={localFilters.tags}
              onToggle={(val) => toggleArrayItem("tags", val)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2 max-w-sm">
          <Input
            placeholder="Search transactions..."
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
          {isDesktop ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            } />
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Narrow down your transactions by specific criteria.
                </SheetDescription>
              </SheetHeader>
              
              <FilterForm />

              <SheetFooter className="mt-auto sm:flex-row gap-2 pb-6 sm:pb-0 px-6 sm:px-2">
                <Button variant="outline" className="w-full sm:w-auto" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button className="w-full sm:w-auto" onClick={handleApplyFilters}>
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger render={
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            } />
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="text-left px-6">
                <DrawerTitle>Advanced Filters</DrawerTitle>
                <DrawerDescription>
                  Narrow down your transactions by specific criteria.
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="overflow-y-auto pb-4">
                <FilterForm />
              </div>

              <DrawerFooter className="pt-2 pb-8 px-6">
                <Button onClick={handleApplyFilters}>Show Results</Button>
                <Button variant="outline" onClick={clearFilters}>Clear All</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden flex flex-col space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const tx = row.original as unknown as TransactionRow;
            const amount = parseFloat(tx.amount as unknown as string);
            const normalizedAmount = parseFloat(tx.normalized_amount as unknown as string);
            const currency = tx.currency_code;
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
              <div key={row.id} className="p-4 rounded-xl border bg-card flex items-start gap-3 shadow-sm">
                <div className="pt-1 shrink-0">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                  />
                </div>

                <div className="flex-1 flex justify-between items-center min-w-0">
                  <div className="flex flex-col space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      {tx.categories ? (
                        <Badge 
                          variant="secondary" 
                          className="font-medium text-[10px] rounded-md shadow-none px-1.5 py-0" 
                          style={tx.categories.color ? { backgroundColor: `${tx.categories.color}20`, color: tx.categories.color } : {}}
                        >
                          {tx.categories.category_name}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Uncategorized</span>
                      )}
                    </div>
                    <span className="font-semibold text-sm truncate">{tx.description}</span>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      {tx.transactions_tags.map(tt => (
                        <Badge 
                          key={tt.tags.tag_id} 
                          variant="outline" 
                          className="text-[9px] h-4 px-1 font-normal bg-background/50 whitespace-nowrap"
                          style={tt.tags.color ? { borderColor: tt.tags.color, color: tt.tags.color } : {}}
                        >
                          {tt.tags.tag_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className={`font-semibold text-base whitespace-nowrap ${amount > 0 ? "text-emerald-500" : "text-foreground"}`}>
                        {amount > 0 ? "+" : "-"}{formatted}
                      </span>
                      {isConverted && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          ≈ {amount > 0 ? "+" : "-"}{formattedNormalized}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {tx.wallets && (
                        <Badge 
                          variant="outline" 
                          className="font-medium text-[9px] rounded-md bg-background py-0 px-1.5 mr-1" 
                          style={tx.wallets.color ? { borderColor: tx.wallets.color, color: tx.wallets.color } : {}}
                        >
                          {tx.wallets.name}
                        </Badge>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="h-6 w-6 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditTransaction(tx)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTransaction(tx)} className="text-red-600 focus:bg-red-500/10 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-8 text-muted-foreground border rounded-xl bg-card">
            No transactions found.
          </div>
        )}
      </div>

      {/* Mobile Compact Pagination */}
      <div className="md:hidden flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                text=""
                onClick={(e) => { e.preventDefault(); if (currentPage > 1 && !isPending) handlePageChange(currentPage - 1); }}
                className={currentPage <= 1 || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            <PaginationItem className="px-4 text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </PaginationItem>

            <PaginationItem>
              <PaginationNext 
                href="#" 
                text=""
                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages && !isPending) handlePageChange(currentPage + 1); }}
                className={currentPage >= totalPages || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Desktop Pagination Controls */}
      <div className="hidden md:flex items-center justify-between px-2 pt-4">
        <div className="text-sm text-muted-foreground flex items-center">
          Showing {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
        </div>
        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (currentPage > 1 && !isPending) handlePageChange(currentPage - 1); }}
                className={currentPage <= 1 || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); if (!isPending) handlePageChange(pageNum); }}
                    isActive={currentPage === pageNum}
                    className={isPending ? "pointer-events-none" : "cursor-pointer"}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages && !isPending) handlePageChange(currentPage + 1); }}
                className={currentPage >= totalPages || isPending ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Edit Drawer */}
      <ResponsiveDrawer
        open={!!editTransaction}
        onOpenChange={(open) => !open && setEditTransaction(null)}
        title="Edit Transaction"
        description="Modify the details of your transaction."
      >
        {editTransaction && (
          <TransactionForm 
            wallets={wallets}
            categories={categories}
            currencies={currencies}
            tags={tags}
            defaultCurrency={currencies[0]?.iso_code || 'EUR'}
            initialData={{
              transaction_id: editTransaction.transaction_id,
              amount: Math.abs(Number(editTransaction.amount)).toFixed(2),
              date: editTransaction.date,
              description: editTransaction.description,
              type: editTransaction.amount >= 0 ? 'income' : 'expense',
              currency_code: editTransaction.currency_code,
              wallet_id: editTransaction.wallet_id,
              category_id: editTransaction.category_id || '',
              tags: editTransaction.transactions_tags.map(t => t.tags.tag_id),
            }}
            onSuccess={() => setEditTransaction(null)}
          />
        )}
      </ResponsiveDrawer>

      {/* Delete Single Dialog */}
      <ActionDialog
        open={!!deleteTransaction}
        onOpenChange={(open) => !open && setDeleteTransaction(null)}
        title="Are you absolutely sure?"
        description="This will permanently delete this transaction. Your wallet balances and dashboard metrics will be automatically updated."
        actionText="Delete Transaction"
        destructive={true}
        isPending={isPending}
        onAction={() => {
          if (deleteTransaction) {
            startTransition(async () => {
              const res = await deleteTransactionAction(deleteTransaction.transaction_id);
              if (res.success) {
                toast.success(res.message);
                setRowSelection(prev => {
                  const newSelection = { ...prev };
                  delete (newSelection as any)[deleteTransaction.transaction_id];
                  return newSelection;
                });
                setDeleteTransaction(null);
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
        title={`Delete ${Object.keys(rowSelection).length} transactions?`}
        description="This will permanently delete the selected transactions. Your wallet balances and dashboard metrics will be automatically updated."
        actionText="Delete Selected"
        destructive={true}
        isPending={isPending}
        onAction={() => {
          const ids = Object.keys(rowSelection);
          if (ids.length > 0) {
            startTransition(async () => {
              const res = await bulkDeleteTransactionsAction(ids);
              if (res.success) {
                toast.success(res.message);
                setRowSelection({}); // Clear selection after successful delete
                setBulkDeleteDialogOpen(false);
              } else {
                toast.error(res.message);
              }
            });
          } else {
            setBulkDeleteDialogOpen(false);
          }
        }}
      />
    </div>
  );
}
