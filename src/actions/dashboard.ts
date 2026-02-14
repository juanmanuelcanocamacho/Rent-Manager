'use server';

import { getLandlordContext } from '@/lib/rbac';
import {
    getRevenueData,
    getOccupancyData,
    getExpenseBreakdown,
    getPaymentStatusData,
    exportDashboardCSV,
} from '@/lib/dashboard-analytics';

/**
 * Fetch all dashboard analytics data
 */
export async function getDashboardAnalytics(months: number = 6) {
    const landlordId = await getLandlordContext();

    const [revenue, occupancy, expenses, payments] = await Promise.all([
        getRevenueData(landlordId, months),
        getOccupancyData(landlordId, months),
        getExpenseBreakdown(landlordId, months),
        getPaymentStatusData(landlordId, months),
    ]);

    return { revenue, occupancy, expenses, payments };
}

/**
 * Export dashboard data as CSV
 */
export async function exportDashboardData(months: number = 6): Promise<string> {
    const landlordId = await getLandlordContext();
    return exportDashboardCSV(landlordId, months);
}
