"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteRecurringPayment, updateRecurringPaymentStatus, skipRecurringPayment } from "../actions";
import { ActionDialog } from "@/components/shared/action-dialog";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/hooks/use-translation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Pause, Play, Trash2, CalendarIcon, FastForward } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/formatters";
import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { RecurringForm } from "./recurring-form";

interface RecurringListProps {
  data: any[];
  totalCount: number;
  currentPage: number;
  primaryCurrencyCode: string;
  dateFormatPreference: string;
  locale: string;
  wallets: any[];
  categories: any[];
  currencies: any[];
}

export function RecurringList({
  data,
  totalCount,
  currentPage,
  primaryCurrencyCode,
  dateFormatPreference,
  locale,
  wallets,
  categories,
  currencies
}: RecurringListProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "paused">("active");

  const handleToggleStatus = (rp: any, newStatus: "active" | "paused") => {
    startTransition(async () => {
      const res = await updateRecurringPaymentStatus(rp.id, { status: newStatus });
      if (res.success) {
        toast.success(`Payment ${newStatus}`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = () => {
    if (deleteItem) {
      startTransition(async () => {
        const res = await deleteRecurringPayment(deleteItem.id);
        if (res.success) {
          toast.success("Deleted successfully");
          setDeleteItem(null);
          router.refresh();
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  const sortedData = [...data].sort((a, b) => new Date(a.next_execution_date).getTime() - new Date(b.next_execution_date).getTime());
  const activePayments = sortedData.filter(rp => rp.status === 'active');
  const pausedPayments = sortedData.filter(rp => rp.status === 'paused');

  const handleSkip = (rp: any) => {
    startTransition(async () => {
      const res = await skipRecurringPayment(rp.id);
      if (res.success) {
        toast.success("Next execution skipped");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const renderCard = (rp: any) => {
    const isIncome = parseFloat(rp.amount) > 0;
    const absAmount = Math.abs(parseFloat(rp.amount)).toFixed(2);
    
    return (
      <Card key={rp.id} className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push(`/scheduled/${rp.id}`)}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{rp.description}</CardTitle>
            <CardDescription className="capitalize">{rp.frequency}</CardDescription>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditItem(rp)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(rp, rp.status === 'active' ? 'paused' : 'active')}>
                {rp.status === 'active' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {rp.status === 'active' ? 'Pause' : 'Resume'}
              </DropdownMenuItem>
              {rp.frequency !== 'once' && rp.status === 'active' && (
                <DropdownMenuItem onClick={() => handleSkip(rp)}>
                  <FastForward className="mr-2 h-4 w-4" />
                  Skip Next
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setDeleteItem(rp)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end pt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant={isIncome ? "default" : "secondary"} className={isIncome ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-600 hover:bg-red-500/20"}>
                {isIncome ? "Income" : "Expense"}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground capitalize">
                {rp.type}
              </Badge>
            </div>
            <div className="text-xl font-bold">
              {absAmount} <span className="text-sm font-normal text-muted-foreground">{rp.currency_code}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            Next: {formatDate(rp.next_execution_date, dateFormatPreference)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active ({activePayments.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedPayments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activePayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No active scheduled payments.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activePayments.map(renderCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="paused" className="mt-6">
          {pausedPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No paused scheduled payments.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pausedPayments.map(renderCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ResponsiveDrawer
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        title="Edit Scheduled Payment"
      >
        {editItem && (
          <RecurringForm 
            wallets={wallets} 
            categories={categories} 
            currencies={currencies} 
            defaultCurrency={primaryCurrencyCode}
            initialData={editItem}
            onSuccess={() => setEditItem(null)}
          />
        )}
      </ResponsiveDrawer>

      <ActionDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete Scheduled Payment"
        description="Are you sure you want to delete this scheduled payment? Future transactions will not be created, but past ones will remain."
        actionText="Delete"
        destructive={true}
        isPending={isPending}
        onAction={handleDelete}
      />
    </div>
  );
}
