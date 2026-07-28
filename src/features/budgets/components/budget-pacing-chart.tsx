'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, Line, ComposedChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { useTranslation } from '@/i18n/hooks/use-translation';

interface BudgetPacingChartProps {
  data: { day: string; balance: number }[];
  targetAmount: number;
  type: 'expense' | 'income';
  dateFormatPreference?: string;
  currencyCode?: string;
  locale?: string;
  className?: string;
}

export function BudgetPacingChart({ 
  data, 
  targetAmount, 
  type,
  className, 
  dateFormatPreference = 'DD/MM/YYYY', 
  currencyCode = 'USD', 
  locale = 'en-US' 
}: BudgetPacingChartProps) {
  const { t } = useTranslation();
  
  const config = {
    balance: {
      label: t('budgets.current' as any) as string,
      color: type === 'expense' ? 'var(--color-primary)' : 'hsl(var(--chart-2))',
    }
  };

  const numericTarget = Number(targetAmount) || 0;
  const chartData = data;

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('budgets.pacingTitle' as any)}</CardTitle>
        <CardDescription>
          {type === 'expense' ? t('budgets.pacingDescription' as any) : t('budgets.pacingIncomeDescription' as any)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={config} className="h-full w-full aspect-auto">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.balance.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.balance.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatDate(value, dateFormatPreference)}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, (dataMax: number) => Math.max(dataMax, numericTarget * 1.05)]}
                tickFormatter={(value) => 
                  new Intl.NumberFormat(locale, { notation: 'compact', style: 'currency', currency: currencyCode }).format(value)
                }
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip 
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} 
                content={<ChartTooltipContent />} 
              />
              <ReferenceLine 
                y={numericTarget} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ 
                  position: 'insideTopLeft', 
                  value: type === 'expense' ? t('budgets.limit' as any) : t('budgets.target' as any), 
                  fill: '#ef4444',
                  fontSize: 12
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={config.balance.color}
                strokeWidth={3}
                fill="url(#fillBalance)"
                activeDot={{ r: 6, fill: config.balance.color, stroke: 'var(--background)', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            </ComposedChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
