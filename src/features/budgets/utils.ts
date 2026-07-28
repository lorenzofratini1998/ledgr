import { differenceInDays } from 'date-fns';

/**
 * Calculates the ideal pacing target for a budget based on the elapsed time.
 * @param amount Total budget amount
 * @param startDate Budget start date
 * @param endDate Budget end date
 * @param todayDate Current date to calculate elapsed days
 * @returns The target amount that should have been spent by today
 */
export function calculatePacingTarget(amount: number, startDate: Date, endDate: Date, todayDate: Date = new Date()): number {
  if (amount <= 0) return 0;
  
  const totalDays = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates
  
  if (totalDays <= 0) return amount; // Fallback if dates are inverted
  
  const elapsedDays = Math.max(0, Math.min(totalDays, differenceInDays(todayDate, startDate)));
  
  return (amount / totalDays) * elapsedDays;
}

/**
 * Calculates the percentage of a target value.
 * @param spent The amount spent
 * @param allocated The allocated target amount
 * @returns A percentage from 0 to 100
 */
export function calculateCategoryPercentage(spent: number, allocated: number): number {
  if (allocated <= 0) return 0;
  const absSpent = Math.abs(spent);
  return Math.min(100, (absSpent / allocated) * 100);
}
