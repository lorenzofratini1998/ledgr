"use client";

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Transaction } from "@/types/models";
import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import {
  deleteTransactionAction,
  bulkDeleteTransactionsAction,
  getTransferDetailsAction,
  confirmPendingTransactionAction,
} from "../actions";
import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { TransactionForm } from "./transaction-form";
import { ActionDialog } from "@/components/shared/action-dialog";
import { Label } from "@/components/ui/label";
import { DataGrid } from "@/components/shared/data-grid/data-grid";
import { DataGridPagination } from "@/components/shared/data-grid/data-grid-pagination";
import { TransactionFilters } from "./transaction-filters";
import { getDateRangeForPeriod } from "@/lib/date-utils";
import { TransactionMobileCard } from "./transaction-mobile-card";
import { useTranslation } from "@/i18n/hooks/use-translation";

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
  dateFormatPreference?: string;
  locale?: string;
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
  primaryCurrencyCode = "EUR",
  dateFormatPreference = "DD/MM/YYYY",
  locale = "en-US"
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [rowSelection, setRowSelection] = useState({});
  const [editTransaction, setEditTransaction] = useState<TransactionRow | null>(null);
  const [editTransferData, setEditTransferData] = useState<any | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<TransactionRow | null>(null);
  const [confirmTransaction, setConfirmTransaction] = useState<TransactionRow | null>(null);
  const [confirmAmountStr, setConfirmAmountStr] = useState("");
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const handleOpenEdit = async (tx: TransactionRow) => {
    if (tx.transfer_id) {
      const res = await getTransferDetailsAction(tx.transfer_id);
      if (res.success && res.data) {
        setEditTransferData(res.data);
        setEditTransaction(tx);
        return;
      }
    }
    setEditTransferData(null);
    setEditTransaction(tx);
  };

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

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams.get("search")]);

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
    let start = "";
    let end = "";
    
    if (preset !== 'custom') {
      const range = getDateRangeForPeriod(preset);
      start = range.from;
      end = range.to;
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
      onEdit: handleOpenEdit,
      onDelete: setDeleteTransaction,
      onConfirm: (tx: TransactionRow) => {
        setConfirmTransaction(tx);
        setConfirmAmountStr(Math.abs(Number(tx.amount)).toFixed(2));
      },
      primaryCurrencyCode: primaryCurrencyCode,
      dateFormatPreference: dateFormatPreference,
      locale: locale
    }
  });

  const clearRecurringFilter = () => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete("recurringId");
    currentParams.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2 max-w-sm">
          <Input
            placeholder={t('transactions.searchPlaceholder') as string}
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
              {t('common.delete')} {Object.keys(rowSelection).length}
            </Button>
          )}
          {isDesktop ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                {t('transactions.filters')}
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            } />
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto flex flex-col justify-between">
              <div>
              <SheetHeader className="mb-6 text-left">
                <SheetTitle>{t('transactions.advancedFiltersTitle')}</SheetTitle>
                <SheetDescription>
                  {t('transactions.advancedFiltersDescription')}
                </SheetDescription>
              </SheetHeader>
              
              <TransactionFilters 
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                currencies={currencies}
                wallets={wallets}
                categories={categories}
                tags={tags}
                applyDatePreset={applyDatePreset}
                handleAmountBlur={(field) => {
                  setLocalFilters(prev => {
                    const val = prev[field];
                    if (!val) return prev;
                    const parsed = parseFloat(val);
                    if (isNaN(parsed)) return prev;
                    return { ...prev, [field]: parsed.toFixed(2) };
                  });
                }}
                toggleArrayItem={toggleArrayItem}
              />
              </div>

              <SheetFooter className="mt-6 pt-4 sm:flex-row gap-3 pb-8 px-2 w-full justify-center">
                <Button variant="outline" className="flex-1" onClick={clearFilters}>
                  {t('transactions.clearAll')}
                </Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  {t('transactions.showResults')}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger render={
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                {t('transactions.filters')}
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            } />
            <DrawerContent className="max-h-[90vh] flex flex-col">
              <DrawerHeader className="text-left px-6">
                <DrawerTitle>{t('transactions.advancedFiltersTitle')}</DrawerTitle>
                <DrawerDescription>
                  {t('transactions.advancedFiltersDescription')}
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="shrink overflow-y-auto px-2">
                <TransactionFilters 
                  localFilters={localFilters}
                  setLocalFilters={setLocalFilters}
                  currencies={currencies}
                  wallets={wallets}
                  categories={categories}
                  tags={tags}
                  applyDatePreset={applyDatePreset}
                  handleAmountBlur={(field) => {
                    setLocalFilters(prev => {
                      const val = prev[field];
                      if (!val) return prev;
                      const parsed = parseFloat(val);
                      if (isNaN(parsed)) return prev;
                      return { ...prev, [field]: parsed.toFixed(2) };
                    });
                  }}
                toggleArrayItem={toggleArrayItem}
                />
              </div>

              <DrawerFooter className="mt-6 pt-4 pb-12 px-6 gap-3">
                <Button onClick={handleApplyFilters} className="w-full" size="lg">{t('transactions.showResults')}</Button>
                <Button variant="outline" onClick={clearFilters} className="w-full" size="lg">{t('transactions.clearAll')}</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
        </div>
      </div>

      {searchParams.get("recurringId") && (
        <div className="flex items-center gap-2 text-sm mt-2">
          <span className="text-muted-foreground">Filtered by a Scheduled Payment</span>
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 flex items-center gap-1" onClick={clearRecurringFilter}>
            Clear <X className="h-3 w-3" />
          </Badge>
        </div>
      )}

      <DataGrid 
        table={table}
        columnsLength={columns.length}
        isPending={isPending}
        noResultsMessage={t('transactions.noTransactionsFound')}
        renderMobileItem={(tx) => (
          <TransactionMobileCard
            row={table.getRowModel().rows.find(r => r.original === tx)!}
            transaction={tx as unknown as TransactionRow}
            primaryCurrencyCode={primaryCurrencyCode}
            dateFormatPreference={dateFormatPreference}
            locale={locale}
            onEdit={handleOpenEdit}
            onDelete={(tx) => setDeleteTransaction(tx)}
            onConfirm={(tx) => {
              setConfirmTransaction(tx as unknown as TransactionRow);
              setConfirmAmountStr(Math.abs(Number(tx.amount)).toFixed(2));
            }}
          />
        )}
      />

      <div className="md:hidden">
        <DataGridPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>

      <div className="hidden md:flex items-center justify-between px-2 pt-4">
        <div className="text-sm text-muted-foreground flex items-center">
          {t('transactions.showing')} {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} {t('transactions.paginationTo')} {Math.min(currentPage * pageSize, totalCount)} {t('transactions.paginationOf')} {totalCount}
        </div>
        <DataGridPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>

      <ResponsiveDrawer
        open={!!editTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setEditTransaction(null);
            setEditTransferData(null);
          }
        }}
        title={editTransferData ? t('transactions.transfer') : t('transactions.editTransaction')}
        description={t('transactions.editTransactionDescription')}
      >
        {editTransaction && (
          <TransactionForm 
            wallets={wallets}
            categories={categories}
            currencies={currencies}
            tags={tags}
            defaultCurrency={currencies[0]?.iso_code || 'EUR'}
            initialData={
              editTransferData || {
                transaction_id: editTransaction.transaction_id,
                amount: Math.abs(Number(editTransaction.amount)).toFixed(2),
                date: editTransaction.date,
                description: editTransaction.description,
                type: editTransaction.amount >= 0 ? 'income' : 'expense',
                currency_code: editTransaction.currency_code,
                wallet_id: editTransaction.wallet_id,
                category_id: editTransaction.category_id || '',
                tags: editTransaction.transactions_tags.map(t => t.tags.tag_id),
              }
            }
            onSuccess={() => {
              setEditTransaction(null);
              setEditTransferData(null);
            }}
          />
        )}
      </ResponsiveDrawer>

      <ActionDialog
        open={!!deleteTransaction}
        onOpenChange={(open) => !open && setDeleteTransaction(null)}
        title={deleteTransaction?.transfer_id ? t('transactions.deleteTransferConfirmTitle') : t('transactions.deleteConfirmTitle')}
        description={deleteTransaction?.transfer_id ? t('transactions.deleteTransferConfirmDescription') : t('transactions.deleteConfirmDescription')}
        actionText={t('transactions.deleteAction')}
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

      {confirmTransaction && (
        <ActionDialog
          open={!!confirmTransaction}
          onOpenChange={(open) => !open && setConfirmTransaction(null)}
          title="Confirm Pending Transaction"
          description="Enter the exact amount to confirm this transaction. It will then impact your wallet balance."
          actionText="Confirm"
          isPending={isPending}
          onAction={() => {
            const amount = parseFloat(confirmAmountStr);
            if (!isNaN(amount) && amount >= 0) {
              startTransition(async () => {
                const res = await confirmPendingTransactionAction(confirmTransaction.transaction_id, amount);
                if (res.success) {
                  toast.success(res.message);
                  setConfirmTransaction(null);
                } else {
                  toast.error(res.message);
                }
              });
            }
          }}
        >
          <div className="py-4">
            <Label htmlFor="confirmAmount">Exact Amount</Label>
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                {currencies.find(c => c.iso_code === confirmTransaction.currency_code)?.symbol || confirmTransaction.currency_code}
              </div>
              <Input 
                id="confirmAmount" 
                type="number" 
                step="0.01"
                min="0.01"
                value={confirmAmountStr} 
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('.')) {
                    const parts = val.split('.');
                    if (parts[1].length > 2) {
                      val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }
                  }
                  setConfirmAmountStr(val);
                }} 
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val && !isNaN(Number(val))) {
                    setConfirmAmountStr(Number(val).toFixed(2));
                  }
                }}
                className="pl-8 text-sm font-medium"
              />
            </div>
          </div>
        </ActionDialog>
      )}

      <ActionDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title={t('transactions.bulkDeleteConfirmTitle')}
        description={t('transactions.bulkDeleteConfirmDescription')}
        actionText={t('transactions.bulkDeleteAction')}
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
