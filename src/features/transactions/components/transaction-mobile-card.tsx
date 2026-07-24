import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { TransactionRow } from "./data-table"
import { Row } from "@tanstack/react-table"
import { useTranslation } from "@/i18n/hooks/use-translation"

interface TransactionMobileCardProps {
  row: Row<any>
  transaction: TransactionRow
  primaryCurrencyCode: string
  onEdit: (tx: TransactionRow) => void
  onDelete: (tx: TransactionRow) => void
}

export function TransactionMobileCard({
  row,
  transaction: tx,
  primaryCurrencyCode,
  onEdit,
  onDelete
}: TransactionMobileCardProps) {
  const amount = parseFloat(tx.amount as unknown as string);
  const normalizedAmount = parseFloat(tx.normalized_amount as unknown as string);
  const currency = tx.currency_code;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(Math.abs(amount));
  const { t } = useTranslation();

  const isConverted = amount !== normalizedAmount && primaryCurrencyCode;
  const formattedNormalized = isConverted ? new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: primaryCurrencyCode,
  }).format(Math.abs(normalizedAmount)) : null;

  return (
    <div className="p-4 rounded-xl border bg-card flex items-start gap-3 shadow-sm">
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
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{t('transactions.uncategorized')}</span>
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
                <DropdownMenuItem onClick={() => onEdit(tx)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('common.edit')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(tx)} className="text-red-600 focus:bg-red-500/10 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
