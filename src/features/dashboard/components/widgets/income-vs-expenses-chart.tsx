'use client';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDate, formatCurrency, formatCompactCurrency } from '@/lib/formatters';

interface IncomeVsExpensesChartProps {
  data: { month: string; income: number; expense: number }[];
  className?: string;
  dateFormatPreference?: string;
  currencyCode?: string;
  locale?: string;
}

export function IncomeVsExpensesChart({ data, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: IncomeVsExpensesChartProps) {
  const config = {
    income: {
      label: 'Income',
      color: '#10b981', // emerald-500
    },
    expense: {
      label: 'Expense',
      color: '#f43f5e', // rose-500
    },
    net: {
      label: 'Net Cashflow',
      color: '#3b82f6', // blue-500
    },
  } satisfies ChartConfig;
  
  const formattedData = data.map(d => {
    const inc = Number(d.income) || 0;
    const exp = Math.abs(Number(d.expense) || 0);
    return {
      ...d,
      expenseAbs: exp,
      net: inc - exp
    };
  });

  return (
    <Card className={cn("col-span-full", className)}>
      <Tabs defaultValue="overview" className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="net">Net Flow</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="overview" className="mt-0">
            <ChartContainer config={config} className="h-[300px] w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value) => formatDate(value + '-01', dateFormatPreference)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => formatCompactCurrency(value, currencyCode, locale)} 
                    width={50}
                  />
                  <ChartTooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }} 
                    content={<ChartTooltipContent 
                      labelFormatter={(label) => formatDate(label + '-01', dateFormatPreference)} 
                      valueFormatter={(value: any) => formatCurrency(Number(value), currencyCode, locale)}
                    />} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenseAbs" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="Expense" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="net" className="mt-0">
            <ChartContainer config={config} className="h-[300px] w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-net)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-net)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value) => formatDate(value + '-01', dateFormatPreference)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => formatCompactCurrency(value, currencyCode, locale)} 
                    width={50}
                  />
                  <ChartTooltip 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }} 
                    content={<ChartTooltipContent 
                      labelFormatter={(label) => formatDate(label + '-01', dateFormatPreference)} 
                      valueFormatter={(value: any) => formatCurrency(Number(value), currencyCode, locale)}
                    />} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="net" 
                    stroke="var(--color-net)" 
                    fillOpacity={1} 
                    fill="url(#colorNet)"
                    name="Net Cashflow"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
