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

export function formatCompactCurrency(
    amount: number,
    currencyCode: string = 'USD',
    locale: string = 'en-US'
): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            notation: "compact",
            maximumFractionDigits: 1
        }).format(amount);
    } catch (error) {
        logger.error(error, `Error formatting compact currency: ${error}`);
        return `${currencyCode} ${amount}`;
    }
}

import { format, parseISO } from "date-fns";

export function formatDate(
  date: Date | string,
  dateFormatPreference: string = 'DD/MM/YYYY'
): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    
    // Map preference to date-fns format
    let formatString = 'dd/MM/yyyy';
    if (dateFormatPreference === 'YYYY-MM-DD') {
      formatString = 'yyyy-MM-dd';
    } else if (dateFormatPreference === 'MM/DD/YYYY') {
      formatString = 'MM/dd/yyyy';
    }
    
    return format(d, formatString);
  } catch (error) {
    logger.error(error, `Error formatting date: ${error}`);
    // Fallback to simple ISO date part if formatting fails
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
  }
}