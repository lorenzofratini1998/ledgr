'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

import { formatDate, formatCompactCurrency, formatCurrency } from '@/lib/formatters';

interface BalanceTrendChartProps {
  data: { day: string; balance: number }[];
  dateFormatPreference?: string;
  currencyCode?: string;
  locale?: string;
}

export function BalanceTrendChart({ data, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: BalanceTrendChartProps & { className?: string }) {
  const config = {
    balance: {
      label: 'Balance',
      color: 'var(--color-primary)',
    },
  };

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Net Worth Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={config} className="h-full w-full aspect-auto">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatDate(value, dateFormatPreference)}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactCurrency(value, currencyCode, locale)}
              />
              <ChartTooltip 
                cursor={false} 
                content={<ChartTooltipContent 
                  labelFormatter={(label) => formatDate(label, dateFormatPreference)} 
                  valueFormatter={(value: any) => formatCurrency(Number(value), currencyCode, locale)}
                />} 
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--color-balance)"
                fillOpacity={1}
                fill="url(#fillBalance)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
