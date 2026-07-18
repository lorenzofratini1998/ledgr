'use client';

import { ResponsiveDrawer } from '@/components/shared/responsive-drawer';
import { Button } from '@/components/ui/button';
import { WalletForm } from '@/features/wallets/components/wallet-form';
import { useDictionary } from '@/i18n/dictionary-provider';
import { Currency } from '@/types/models';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface CreateWalletTriggerProps {
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrencyCode: string;
}

export function CreateWalletTrigger({ currencies, defaultCurrencyCode }: CreateWalletTriggerProps) {
  const [open, setOpen] = useState(false);
  const dictionary = useDictionary();

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Trigger */}
      <Button className="hidden md:flex" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> {dictionary.wallets.newWallet}
      </Button>
      
      {/* Mobile FAB Trigger */}
      <Button className="fixed bottom-20 right-4 rounded-full shadow-lg h-14 w-14 p-0 flex md:hidden z-50" onClick={() => setOpen(true)}>
        <Plus className="h-6 w-6" />
      </Button>

      <ResponsiveDrawer
        open={open}
        onOpenChange={setOpen}
        title={dictionary.wallets.createWallet}
        description={dictionary.wallets.addWalletDescription}
      >
        <WalletForm currencies={currencies} defaultCurrencyCode={defaultCurrencyCode} onSuccess={handleSuccess} />
      </ResponsiveDrawer>
    </>
  );
}
