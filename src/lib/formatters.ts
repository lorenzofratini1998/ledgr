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
        console.error(`Error formatting currency: ${error}`, error);
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
}