import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { Wallet } from 'lucide-react';
import { OnboardingDictionary } from './onboarding-form';

interface PreviewCardProps {
    theme: string;
    dateFormat: string;
    currencyCode: string;
    languageLocale: string;
    dict: OnboardingDictionary;
}

export function PreviewCard({ theme, dateFormat, currencyCode, languageLocale, dict }: PreviewCardProps) {
    const today = new Date();
    const formattedDate = dateFormat === 'DD/MM/YYYY'
        ? `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
        : dateFormat === 'MM/DD/YYYY'
            ? `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
            : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <Card
            className="w-full overflow-hidden transition-colors duration-500 shadow-xl"
            style={
                theme === 'dark' ? {
                    '--card': 'oklch(0.205 0 0)',
                    '--card-foreground': 'oklch(0.985 0 0)',
                    '--foreground': 'oklch(0.985 0 0)',
                    '--muted-foreground': 'oklch(0.708 0 0)'
                } as React.CSSProperties : theme === 'light' ? {
                    '--card': 'oklch(1 0 0)',
                    '--card-foreground': 'oklch(0.145 0 0)',
                    '--foreground': 'oklch(0.145 0 0)',
                    '--muted-foreground': 'oklch(0.556 0 0)'
                } as React.CSSProperties : undefined
            }
        >
            <CardHeader className="pb-4">
                <CardDescription className="transition-colors text-muted-foreground">
                    {formattedDate || dict.date_format_placeholder}
                </CardDescription>
                <CardTitle className="text-2xl flex items-center justify-between">
                    <span>{dict.preview_net_worth}</span>
                    <Wallet className="w-6 h-6 opacity-50" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl lg:text-5xl font-bold tracking-tighter transition-all">
                    {formatCurrency(12345.67, currencyCode, languageLocale)}
                </div>
                <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">{dict.preview_checking}</span>
                        <span className="font-medium">{formatCurrency(4500.00, currencyCode, languageLocale)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-70">{dict.preview_savings}</span>
                        <span className="font-medium">{formatCurrency(7845.67, currencyCode, languageLocale)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}