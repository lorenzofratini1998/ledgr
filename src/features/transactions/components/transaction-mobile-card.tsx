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
import { formatDate, formatCurrency } from "@/lib/formatters"

interface TransactionMobileCardProps {
  row: Row<any>
  transaction: TransactionRow
  primaryCurrencyCode: string
  dateFormatPreference: string
  locale?: string
  onEdit: (tx: TransactionRow) => void
  onDelete: (tx: TransactionRow) => void
  onConfirm: (tx: TransactionRow) => void
}

export function TransactionMobileCard({
  row,
  transaction: tx,
  primaryCurrencyCode,
  dateFormatPreference,
  locale = 'en-US',
  onEdit,
  onDelete,
  onConfirm
}: TransactionMobileCardProps) {
  const amount = parseFloat(tx.amount as unknown as string);
  const normalizedAmount = parseFloat(tx.normalized_amount as unknown as string);
  const currency = tx.currency_code;
  const formatted = formatCurrency(Math.abs(amount), currency, locale);
  const { t } = useTranslation();

  const isTransfer = !!tx.transfer_id;
  const isConverted = amount !== normalizedAmount && primaryCurrencyCode;
  const formattedNormalized = isConverted ? formatCurrency(Math.abs(normalizedAmount), primaryCurrencyCode, locale) : null;

  const amountColor = isTransfer
    ? "text-blue-600 dark:text-blue-400"
    : amount > 0
    ? "text-emerald-500"
    : "text-foreground";

  const amountPrefix = isTransfer ? "⇄ " : amount > 0 ? "+" : "-";

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
            {isTransfer ? (
              <Badge 
                variant="outline" 
                className="font-medium text-[10px] rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-1.5 py-0"
              >
                {t('transactions.transfer')}
              </Badge>
            ) : tx.categories ? (
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
            {tx.status === 'pending' && (
              <Badge variant="outline" className="text-[10px] h-4 px-1 font-normal bg-amber-500/10 text-amber-500 border-amber-500/20">
                Pending
              </Badge>
            )}
          </div>
          <span className="font-semibold text-sm truncate">{tx.description}</span>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(tx.date, dateFormatPreference)}
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
            <span className={`font-semibold text-base whitespace-nowrap ${amountColor}`}>
              {amountPrefix}{formatted}
            </span>
            {isConverted && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                ≈ {amountPrefix}{formattedNormalized}
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
                {tx.status === 'pending' && (
                  <>
                    <DropdownMenuItem onClick={() => onConfirm(tx)} className="text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-600">
                      Confirm Execution
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
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
