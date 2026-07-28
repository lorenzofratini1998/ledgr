'use client';

import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatCompactCurrency } from '@/lib/formatters';
import { format, parseISO } from 'date-fns';

interface RecurringHistoryDataPoint {
  date: string;
  amount: number;
  normalized_amount: number;
  currency_code: string;
}

interface RecurringHistoryChartProps {
  data: RecurringHistoryDataPoint[];
  className?: string;
  dateFormatPreference?: string;
  currencyCode?: string;
  locale?: string;
}

export function RecurringHistoryChart({ data, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: RecurringHistoryChartProps) {
  const config = {
    amount: {
      label: 'Amount',
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM yyyy'),
    amountValue: Math.abs(d.normalized_amount || d.amount || 0),
  }));

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Cost History</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {formattedData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No historical data available yet.
          </div>
        ) : (
          <ChartContainer config={config} className="h-[250px] w-full aspect-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="dateLabel" 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => formatCompactCurrency(value, currencyCode, locale)}
                />
                <ChartTooltip 
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {format(parseISO(item.date), dateFormatPreference === 'MM/DD/YYYY' ? 'MM/dd/yyyy' : dateFormatPreference === 'YYYY-MM-DD' ? 'yyyy-MM-dd' : 'dd/MM/yyyy')}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Amount
                              </span>
                              <span className="font-bold">
                                {formatCurrency(item.amountValue, item.currency_code, locale)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="amountValue" 
                  fill="var(--color-amount)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                >
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Number(entry.amount) < 0 ? '#f43f5e' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
