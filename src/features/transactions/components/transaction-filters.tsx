import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { MultiSelect } from "@/components/shared/multi-select"
import { useTranslation } from "@/i18n/hooks/use-translation"
import { DASHBOARD_PERIODS } from "@/lib/constants/core"

interface TransactionFiltersProps {
  localFilters: {
    wallets: string[]
    categories: string[]
    tags: string[]
    currencies: string[]
    datePreset: string
    startDate: string
    endDate: string
    minAmount: string
    maxAmount: string
    type: string
  }
  setLocalFilters: React.Dispatch<React.SetStateAction<any>>
  currencies: any[]
  wallets: any[]
  categories: any[]
  tags: any[]
  applyDatePreset: (preset: string) => void
  handleAmountBlur: (field: 'minAmount' | 'maxAmount') => void
  toggleArrayItem: (key: 'wallets' | 'categories' | 'tags' | 'currencies', id: string) => void
}

export function TransactionFilters({
  localFilters,
  setLocalFilters,
  currencies,
  wallets,
  categories,
  tags,
  applyDatePreset,
  handleAmountBlur,
  toggleArrayItem
}: TransactionFiltersProps) {
  const selectedCurrencySymbol = localFilters.currencies.length === 1 
    ? currencies.find(c => c.iso_code === localFilters.currencies[0])?.symbol || null
    : null;
  const { t } = useTranslation();

  return (
    <div className="py-4 px-4 sm:px-2 space-y-6">
      
      {/* Transaction Type */}
      <div className="space-y-3">
        <Label>{t('transactions.transactionType')}</Label>
        <div className="flex bg-muted p-1 rounded-lg w-full items-center">
          <button
            className={cn("flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setLocalFilters((p: any) => ({ ...p, type: 'all' }))}
          >
            {t('transactions.all')}
          </button>
          <button
            className={cn("flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'income' ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setLocalFilters((p: any) => ({ ...p, type: 'income' }))}
          >
            {t('transactions.income')}
          </button>
          <button
            className={cn("flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'expense' ? "bg-background shadow-sm text-rose-500" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setLocalFilters((p: any) => ({ ...p, type: 'expense' }))}
          >
            {t('transactions.expense')}
          </button>
          <button
            className={cn("flex-1 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all outline-hidden cursor-pointer", localFilters.type === 'transfer' ? "bg-background shadow-sm text-blue-500" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setLocalFilters((p: any) => ({ ...p, type: 'transfer' }))}
          >
            {t('transactions.transfers')}
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-3">
        <Label>{t('transactions.dateRange')}</Label>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_PERIODS.map(preset => (
            <Badge 
              key={preset}
              variant={localFilters.datePreset === preset ? 'default' : 'secondary'} 
              className="cursor-pointer" 
              onClick={() => {
                if (preset === 'custom') setLocalFilters((p: any) => ({ ...p, datePreset: 'custom' }))
                else applyDatePreset(preset)
              }}
            >
              {preset === 'custom' ? t('transactions.custom') : t(`dashboard.periods.${preset}`)}
            </Badge>
          ))}
        </div>
        
        {localFilters.datePreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('transactions.from')}</Label>
              <Input 
                type="date" 
                value={localFilters.startDate}
                onChange={(e) => setLocalFilters((prev: any) => ({ ...prev, startDate: e.target.value }))}
                className="block w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('transactions.to')}</Label>
              <Input 
                type="date" 
                value={localFilters.endDate}
                onChange={(e) => setLocalFilters((prev: any) => ({ ...prev, endDate: e.target.value }))}
                className="block w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Currency */}
      <div className="space-y-3">
        <Label>{t('common.currency')}</Label>
        <MultiSelect 
          title="currencies"
          options={currencies.map(c => ({ label: `${c.iso_code} - ${c.name}`, value: c.iso_code }))}
          selectedValues={localFilters.currencies}
          onToggle={(val) => toggleArrayItem("currencies", val)}
        />
      </div>

      {/* Amount Range */}
      <div className="space-y-3">
        <Label>{t('transactions.amountRange')}</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('transactions.minAmount')}</Label>
            <div className="relative">
              {selectedCurrencySymbol && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                  {selectedCurrencySymbol}
                </div>
              )}
              <Input 
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={localFilters.minAmount}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('.')) {
                    const parts = val.split('.');
                    if (parts[1].length > 2) {
                      val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }
                  }
                  setLocalFilters((prev: any) => ({ ...prev, minAmount: val }));
                }}
                onBlur={() => handleAmountBlur('minAmount')}
                className={cn("text-lg font-medium", selectedCurrencySymbol ? "pl-8" : "")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{t('transactions.maxAmount')}</Label>
            <div className="relative">
              {selectedCurrencySymbol && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                  {selectedCurrencySymbol}
                </div>
              )}
              <Input 
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                value={localFilters.maxAmount}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.includes('.')) {
                    const parts = val.split('.');
                    if (parts[1].length > 2) {
                      val = `${parts[0]}.${parts[1].slice(0, 2)}`;
                    }
                  }
                  setLocalFilters((prev: any) => ({ ...prev, maxAmount: val }));
                }}
                onBlur={() => handleAmountBlur('maxAmount')}
                className={cn("text-lg font-medium", selectedCurrencySymbol ? "pl-8" : "")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div className="space-y-3">
        <Label>{t('common.wallets')}</Label>
        <MultiSelect 
          title="wallets"
          options={wallets.map(w => ({ label: w.name, value: w.id }))}
          selectedValues={localFilters.wallets}
          onToggle={(val) => toggleArrayItem("wallets", val)}
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label>{t('common.categories')}</Label>
        <MultiSelect 
          title="categories"
          options={categories.map(c => ({ label: c.category_name, value: c.category_id }))}
          selectedValues={localFilters.categories}
          onToggle={(val) => toggleArrayItem("categories", val)}
        />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-3">
          <Label>{t('transactions.tags')}</Label>
          <MultiSelect 
            title="tags"
            options={tags.map(t => ({ label: t.tag_name, value: t.tag_id }))}
            selectedValues={localFilters.tags}
            onToggle={(val) => toggleArrayItem("tags", val)}
          />
        </div>
      )}
    </div>
  );
}
