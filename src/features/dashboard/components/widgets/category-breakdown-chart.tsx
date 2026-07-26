'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { CATEGORY_ICON_MAP, CATEGORY_COLOR_MAP } from '@/features/categories/constants';
import { PercentageBadge } from '@/components/ui/percentage-badge';

interface CategoryBreakdownChartProps {
  data: { category_id: string; category_name: string; color: string; icon: string; amount: number; compareAmount?: number }[];
  currencyCode: string;
  locale?: string;
  className?: string;
  vsPreviousLabel?: string;
}

export function CategoryBreakdownChart({ data, currencyCode, locale = 'en-US', className, vsPreviousLabel }: CategoryBreakdownChartProps) {
  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }, [data]);

  const displayData = useMemo(() => {
    // PieChart requires positive values, so we map the amounts to their absolute value
    const absoluteData = data.map(item => ({ 
      ...item, 
      amount: Math.abs(item.amount)
    }));
    const sorted = absoluteData.sort((a, b) => b.amount - a.amount);
    
    let processed = sorted;
    if (sorted.length > 5) {
      const top4 = sorted.slice(0, 4);
      const others = sorted.slice(4).reduce(
        (acc, curr) => ({
          ...acc,
          amount: acc.amount + curr.amount,
          compareAmount: (acc.compareAmount || 0) + (curr.compareAmount || 0),
        }),
        { category_id: 'others', category_name: 'Others', color: '#94a3b8', icon: 'MoreHorizontal', amount: 0, compareAmount: 0 }
      );
      processed = [...top4, others];
    }
    
    // Assign fill using CSS variables mapped to category_id
    return processed.map(item => ({
      ...item,
      fill: `var(--color-${item.category_id})`
    }));
  }, [data]);

  // Generate dynamic chart config based on displayData
  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color?: string }> = {
      amount: { label: 'Amount' },
    };
    displayData.forEach(item => {
      const hexColor = item.color && CATEGORY_COLOR_MAP[item.color as keyof typeof CATEGORY_COLOR_MAP] 
        ? CATEGORY_COLOR_MAP[item.color as keyof typeof CATEGORY_COLOR_MAP].hex 
        : '#94a3b8';
        
      config[item.category_id] = {
        label: item.category_name,
        color: hexColor,
      };
    });
    return config;
  }, [displayData]);

  return (
    <Card className={cn("col-span-full", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            No spending data for this period
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 flex items-center justify-center min-h-[250px]">
              <ChartContainer
                config={chartConfig as any}
                className="mx-auto aspect-square w-full max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel valueFormatter={(value: any) => formatCurrency(Number(value), currencyCode, locale)} />}
                  />
                  <Pie
                    data={displayData}
                    dataKey="amount"
                    nameKey="category_id"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {displayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-5">
              {displayData.map((category) => {
                const Icon = category.icon && CATEGORY_ICON_MAP[category.icon as keyof typeof CATEGORY_ICON_MAP]
                  ? CATEGORY_ICON_MAP[category.icon as keyof typeof CATEGORY_ICON_MAP]
                  : Icons.Circle;

                const percentage = totalAmount > 0 ? (Math.abs(category.amount) / totalAmount) * 100 : 0;
                // Ensure small percentages are at least visible if amount > 0
                const displayWidth = category.amount > 0 ? Math.max(percentage, 2) : 0;

                const hexColor = category.color && CATEGORY_COLOR_MAP[category.color as keyof typeof CATEGORY_COLOR_MAP] 
                  ? CATEGORY_COLOR_MAP[category.color as keyof typeof CATEGORY_COLOR_MAP].hex 
                  : '#94a3b8';

                return (
                  <div key={category.category_id} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${hexColor}20`, color: hexColor }}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="font-medium text-sm truncate">{category.category_name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-sm">
                          {formatCurrency(Math.abs(category.amount), currencyCode, locale)}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                          {category.compareAmount !== undefined && Math.abs(category.compareAmount) > 0 && (
                            <>
                              <span className="text-muted-foreground/30 text-[10px]">•</span>
                              <PercentageBadge 
                                current={Math.abs(category.amount)} 
                                previous={Math.abs(category.compareAmount)} 
                                invertColors 
                                className="mt-0"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${displayWidth}%`,
                          backgroundColor: hexColor
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
