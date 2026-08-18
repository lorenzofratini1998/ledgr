'use client';

import { useState, useTransition } from 'react';
import { QuickTransactionWithDetails, CategoryOption, Currency } from '@/types/models';
import { executeQuickTransactionAction } from '../actions';
import { deleteTransactionAction } from '@/features/transactions/actions';
import { QuickTransactionDialog } from './quick-transaction-dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { toast } from 'sonner';
import { Sparkles, Plus, Loader2, Settings2, Zap } from 'lucide-react';
import { CATEGORY_COLOR_MAP, CATEGORY_ICON_MAP, CategoryColor, CategoryIcon } from '@/features/categories/constants';
import { Badge } from '@/components/ui/badge';

interface QuickTransactionsBarProps {
  quickTransactions: QuickTransactionWithDetails[];
  wallets: { id: string; name: string; currency_code: string; type?: string; is_default: boolean }[];
  categories: CategoryOption[];
  currencies: Pick<Currency, 'iso_code' | 'name' | 'symbol'>[];
  defaultCurrency?: string;
  locale?: string;
}

export function QuickTransactionsBar({
  quickTransactions,
  wallets,
  categories,
  currencies,
  defaultCurrency = 'EUR',
  locale = 'en-US',
}: QuickTransactionsBarProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUndo = async (transactionId: string) => {
    try {
      const res = await deleteTransactionAction(transactionId);
      if (res.success) {
        toast.success(t('quickTransactions.undoneSuccess'));
      } else {
        toast.error(res.message || t('quickTransactions.failedUndo'));
      }
    } catch {
      toast.error(t('quickTransactions.failedUndo'));
    }
  };

  const handleExecute = (template: QuickTransactionWithDetails) => {
    if (executingId || isPending) return;

    // Trigger haptic feedback on mobile devices if available
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {
        // Ignore if unsupported or restricted
      }
    }

    setExecutingId(template.id);
    startTransition(async () => {
      try {
        const res = await executeQuickTransactionAction({ id: template.id });

        if (res.success && res.data) {
          const formattedAmount = formatCurrency(
            Math.abs(Number(template.amount)),
            template.currency_code,
            locale
          );
          const prefix = template.type === 'income' ? '+' : '-';

          toast.success(
            t('quickTransactions.executedSuccess', {
              name: template.name,
              amount: `${prefix}${formattedAmount}`,
            }),
            {
              duration: 5000,
              action: {
                label: t('quickTransactions.undo'),
                onClick: () => handleUndo(res.data!.transaction_id),
              },
            }
          );
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error(t('quickTransactions.failedUndo'));
      } finally {
        setExecutingId(null);
      }
    });
  };

  return (
    <>
      <div className="w-full space-y-2.5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Zap className="w-3.5 h-3.5 fill-amber-500/40" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {t('quickTransactions.title')}
            </h2>
            <Badge variant="secondary" className="text-[10px] font-medium h-5 px-1.5 rounded-md text-muted-foreground">
              {quickTransactions.length}/5
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-lg"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('quickTransactions.manageTemplates')}</span>
          </Button>
        </div>

        {/* Empty State Banner (if no quick transactions exist) */}
        {quickTransactions.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl border border-dashed border-border/80 bg-card/40 hover:bg-card/70 transition-all gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t('quickTransactions.noTemplates')}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {t('quickTransactions.noTemplatesDesc')}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="h-8 text-xs font-medium gap-1.5 rounded-xl border-border shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('quickTransactions.addTemplate')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {quickTransactions.map((item) => {
              const isExecuting = executingId === item.id;
              const catIconKey = (item.category?.icon as CategoryIcon) || 'tag';
              const IconComp = CATEGORY_ICON_MAP[catIconKey] || CATEGORY_ICON_MAP.tag;
              const colorKey = (item.category?.color as CategoryColor) || 'slate';
              const colorConfig = CATEGORY_COLOR_MAP[colorKey] || CATEGORY_COLOR_MAP.slate;

              const formattedAmount = formatCurrency(
                Math.abs(Number(item.amount)),
                item.currency_code,
                locale
              );
              const isIncome = item.type === 'income';

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isExecuting || !!executingId}
                  onClick={() => handleExecute(item)}
                  aria-label={`One-tap transaction: ${item.name}`}
                  className={`group relative flex flex-col justify-between p-3 rounded-2xl border text-left bg-card hover:bg-accent/40 active:scale-[0.98] transition-all duration-200 shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[96px] ${
                    isExecuting ? 'opacity-80 scale-[0.98] border-primary ring-1 ring-primary/30' : 'border-border/70 hover:border-border'
                  }`}
                >
                  {/* Top row: Category Icon & Type Badge */}
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${colorConfig.bg}`}
                    >
                      {isExecuting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconComp className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-muted/60 text-muted-foreground border-border/50'
                      }`}
                    >
                      {isIncome ? t('quickTransactions.income') : t('quickTransactions.expense')}
                    </span>
                  </div>

                  {/* Bottom row: Name, Wallet, Amount */}
                  <div className="mt-2.5 flex flex-col">
                    <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                    <div className="flex items-center justify-between mt-1 gap-1">
                      <span className="text-[11px] text-muted-foreground truncate max-w-[70px]">
                        {item.wallet?.name || 'Wallet'}
                      </span>
                      <span
                        className={`text-xs font-bold tracking-tight ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                        }`}
                      >
                        {formattedAmount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Add Template Card if slots available (< 5) */}
            {quickTransactions.length < 5 && (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground active:scale-[0.98] transition-all duration-200 shadow-2xs min-h-[92px] gap-1.5"
              >
                <div className="w-7 h-7 rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground group-hover:text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">{t('quickTransactions.addTemplate')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <QuickTransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        quickTransactions={quickTransactions}
        wallets={wallets}
        categories={categories}
        currencies={currencies}
        defaultCurrency={defaultCurrency}
      />
    </>
  );
}
