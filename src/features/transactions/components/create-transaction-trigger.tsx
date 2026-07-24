'use client';

import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { TransactionForm } from './transaction-form';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { Currency, Tag } from '@/types/models';
import { Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface CreateTransactionTriggerProps {
  wallets: { id: string; name: string; currency_code: string; is_default: boolean }[];
  categories: { category_id: string; category_name: string }[];
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  tags: Tag[];
  defaultCurrency: string;
}

export function CreateTransactionTrigger({
  wallets,
  categories,
  currencies,
  tags,
  defaultCurrency
}: CreateTransactionTriggerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Trigger */}
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> {t('transactions.addTransaction')}
      </Button>
      
      {/* Mobile FAB Trigger */}
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title={t('transactions.addTransaction')}
        description={t('transactions.addDescription')}
      >
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">{t('transactions.noWalletFound')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('transactions.noWalletDescription')}
            </p>
            <Link 
              href="/wallets" 
              className={buttonVariants({ className: "mt-4" })} 
              onClick={() => setOpen(false)}
            >
              {t('transactions.goToWallets')}
            </Link>
          </div>
        ) : (
          <TransactionForm 
            wallets={wallets}
            categories={categories}
            currencies={currencies}
            tags={tags}
            defaultCurrency={defaultCurrency}
            onSuccess={handleSuccess}
          />
        )}
      </ResponsiveDrawer>
    </>
  );
}
