import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

export function WalletSelect({
  value,
  onValueChange,
  wallets,
  placeholder = "Select a wallet",
  disabled = false,
}: WalletSelectProps) {
  return (
    <Select value={value} onValueChange={(val) => onValueChange(val || "")} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
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
