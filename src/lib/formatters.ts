import { logger } from "@/lib/logger";

export function formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    locale: string = 'en-US'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    } catch (error) {
        logger.error(error, `Error formatting currency: ${error}`);
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
}