import { addMonths as dateFnsAddMonths, setDate, endOfMonth, isBefore, startOfDay, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Madrid';

export function getNowInMadrid(): Date {
    return toZonedTime(new Date(), TIMEZONE);
}

export function toMadridDate(date: Date): Date {
    return toZonedTime(date, TIMEZONE);
}

export function addMonths(date: Date, amount: number): Date {
    return dateFnsAddMonths(date, amount);
}

/**
 * Calculates a due date ensuring it respects the billing day logic.
 * If billingDay is 31 and the month only has 30 days, it uses the 30th.
 */
export function calculateDueDate(year: number, month: number, billingDay: number): Date {
    // Create a date for the 1st of the target month
    // Note: month is 0-indexed in JS Date? No, let's use standard ISO or constructor.
    // We'll use a safe construction.
    const targetMonthStart = new Date(year, month, 1);
    const lastDayOfMonth = endOfMonth(targetMonthStart).getDate();
    const day = Math.min(billingDay, lastDayOfMonth);

    const dueDate = new Date(year, month, day);
    // Ensure we keep hours zeroed for "Date only" semantics
    return startOfDay(dueDate);
}

export function formatParamDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}
