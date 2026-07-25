'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface BalanceTrendChartProps {
  data: { day: string; balance: number }[];
}

export function BalanceTrendChart({ data, className }: BalanceTrendChartProps & { className?: string }) {
  const config = {
    balance: {
      label: 'Balance',
      color: 'hsl(var(--primary))',
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
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) return `€${(value / 1000).toFixed(1)}k`;
                  return `€${value}`;
                }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
