import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface WalletOption {
  id: string;
  name: string;
  currency_code: string;
}

interface WalletSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  wallets: WalletOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function WalletSelect({
  value,
  onValueChange,
  wallets,
  placeholder = "Select a wallet",
  disabled = false,
  className,
}: WalletSelectProps) {
  const selectedWallet = wallets.find((w) => w.id === value);

  return (
    <Select value={value || ""} onValueChange={(val) => onValueChange(val || "")} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedWallet ? (
            <span className="truncate block text-left">
              {selectedWallet.name} ({selectedWallet.currency_code})
            </span>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {wallets.map((wallet) => (
          <SelectItem key={wallet.id} value={wallet.id}>
            {wallet.name} ({wallet.currency_code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
