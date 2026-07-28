"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveDrawer } from "@/components/shared/responsive-drawer";
import { RecurringForm } from "./recurring-form";

interface CreateRecurringTriggerProps {
  wallets: any[];
  categories: any[];
  currencies: any[];
  defaultCurrency: string;
}

export function CreateRecurringTrigger({
  wallets,
  categories,
  currencies,
  defaultCurrency
}: CreateRecurringTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Trigger */}
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> New Scheduled Payment
      </Button>
      
      {/* Mobile FAB Trigger */}
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title="New Scheduled Payment"
        description="Schedule a recurring transaction or a future bill."
      >
        <RecurringForm
          wallets={wallets}
          categories={categories}
          currencies={currencies}
          defaultCurrency={defaultCurrency}
          onSuccess={() => setOpen(false)}
        />
      </ResponsiveDrawer>
    </>
  );
}
