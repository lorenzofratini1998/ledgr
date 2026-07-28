"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRecurringPaymentSchema, CreateRecurringPaymentPayload } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createRecurringPayment, updateRecurringPayment } from "../actions";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { CurrencySelector } from "@/components/shared/currency-selector";
import { TransactionTypeToggle } from "@/components/shared/transaction-type-toggle";
import { SubmitButton } from "@/components/shared/submit-button";

interface RecurringFormProps {
  wallets: any[];
  categories: any[];
  currencies: any[];
  defaultCurrency: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function RecurringForm({ wallets, categories, currencies, defaultCurrency, initialData, onSuccess }: RecurringFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasEndDate, setHasEndDate] = useState(!!initialData?.end_date);
  const [endStrategy, setEndStrategy] = useState<"date" | "occurrences">("date");
  const [occurrences, setOccurrences] = useState("1");

  const form = useForm<CreateRecurringPaymentPayload>({
    resolver: zodResolver(createRecurringPaymentSchema),
    defaultValues: initialData ? {
      ...initialData,
      start_date: initialData.next_execution_date || initialData.start_date, // Map next_execution_date to start_date for editing
      amount: Math.abs(initialData.amount).toString(),
      transaction_type: initialData.amount < 0 ? "expense" : "income",
      end_date: initialData.end_date || undefined,
      category_id: initialData.category_id || undefined,
    } : {
      amount: "",
      transaction_type: "expense",
      type: "fixed",
      frequency: "monthly",
      currency_code: defaultCurrency,
      wallet_id: wallets.length > 0 ? wallets[0].id : "",
      category_id: "",
      description: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: undefined,
    }
  });

  const selectedCurrencyCode = form.watch('currency_code');
  const selectedCurrency = currencies.find(c => c.iso_code === selectedCurrencyCode);

  const onSubmit = (data: CreateRecurringPaymentPayload) => {
    startTransition(async () => {
      let finalEndDate = data.end_date;
      
      if (hasEndDate && endStrategy === "occurrences") {
        const start = new Date(data.start_date);
        const occs = parseInt(occurrences, 10);
        if (!isNaN(occs) && occs > 0) {
          const end = new Date(start);
          if (data.frequency === "daily") end.setDate(end.getDate() + occs - 1);
          if (data.frequency === "weekly") end.setDate(end.getDate() + (occs - 1) * 7);
          if (data.frequency === "monthly") end.setMonth(end.getMonth() + occs - 1);
          if (data.frequency === "yearly") end.setFullYear(end.getFullYear() + occs - 1);
          finalEndDate = end.toISOString().split("T")[0];
        }
      } else if (!hasEndDate) {
        finalEndDate = undefined;
      }

      let res;
      if (initialData) {
        res = await updateRecurringPayment({
          ...data,
          id: initialData.id,
          end_date: finalEndDate,
        });
      } else {
        res = await createRecurringPayment({
          ...data,
          end_date: finalEndDate,
        });
      }

      if (res.success) {
        toast.success(initialData ? "Scheduled payment updated" : "Scheduled payment created");
        form.reset();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Type Selector (Segmented Control via Tabs) */}
        <FormField
          control={form.control}
          name="transaction_type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TransactionTypeToggle value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                      {selectedCurrency?.symbol || '$'}
                    </div>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      placeholder="0.00" 
                      className="pl-8 text-base font-medium"
                      {...field}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val.includes('.')) {
                          const parts = val.split('.');
                          if (parts[1].length > 2) {
                            val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                          }
                        }
                        field.onChange(val);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        const val = e.target.value;
                        if (val && !isNaN(Number(val))) {
                          form.setValue("amount", Number(val).toFixed(2), { shouldValidate: true });
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <CurrencySelector
                    value={field.value}
                    onValueChange={field.onChange}
                    currencies={currencies}
                    hideIcon
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="E.g. Netflix Subscription" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Frequency">
                        <span className="truncate block text-left capitalize">
                          {field.value}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Amount Type">
                        <span className="truncate block text-left">
                          {field.value === "fixed" ? "Fixed" : "Variable (Pending)"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="variable">Variable (Pending)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select wallet">
                        <span className="truncate block text-left">
                          {field.value ? wallets.find(w => w.id === field.value)?.name : null}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wallets.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category">
                        <span className="truncate block text-left">
                          {field.value ? categories.find(c => c.category_id === field.value)?.category_name : "None"}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.category_id} value={c.category_id}>{c.category_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {initialData ? "Next Execution Date" : "Start Date"}
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                {initialData && (
                  <p className="text-[0.8rem] text-muted-foreground">
                    Modifying this date to the past will retroactively generate missing transactions.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("frequency") !== "once" && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Set an End Date</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically stop this payment after a specific date or number of occurrences.
                  </p>
                </div>
                <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} />
              </div>
              
              {hasEndDate && (
                <div className="pt-2 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">End Strategy</Label>
                    <Select value={endStrategy} onValueChange={(val: any) => setEndStrategy(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Strategy">
                          <span className="truncate block text-left">
                            {endStrategy === "date" ? "On Specific Date" : "After Occurrences"}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">On Specific Date</SelectItem>
                        <SelectItem value="occurrences">After Occurrences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {endStrategy === "date" ? (
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs">End Date</Label>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs">Number of times</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={occurrences} 
                        onChange={(e) => setOccurrences(e.target.value)} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <SubmitButton isPending={isPending}>
          {initialData ? "Update scheduled payment" : "Create scheduled payment"}
        </SubmitButton>
      </form>
    </Form>
  );
}
