import { db } from '@/lib/db';
import { ExpenseCategory } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types for chart data
export interface RevenueDataPoint {
    month: string;
    ingresos: number;
    gastos: number;
    beneficio: number;
}

export interface OccupancyDataPoint {
    month: string;
    ocupacion: number;
    total: number;
    ocupadas: number;
}

export interface ExpenseBreakdownItem {
    category: string;
    label: string;
    value: number;
    color: string;
}

export interface PaymentStatusItem {
    status: string;
    label: string;
    count: number;
    amount: number;
    color: string;
}

// Map expense categories to Spanish labels
const CATEGORY_LABELS: Record<string, string> = {
    MAINTENANCE: 'Mantenimiento',
    UTILITIES: 'Suministros',
    INSURANCE: 'Seguros',
    TAXES: 'Impuestos',
    OTHER: 'Otros',
};

const CATEGORY_COLORS: Record<string, string> = {
    MAINTENANCE: '#f59e0b',
    UTILITIES: '#3b82f6',
    INSURANCE: '#8b5cf6',
    TAXES: '#ef4444',
    OTHER: '#6b7280',
};

/**
 * Get monthly revenue data for the last N months
 */
export async function getRevenueData(landlordId: string, months: number = 6): Promise<RevenueDataPoint[]> {
    const data: RevenueDataPoint[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM yy', { locale: es });

        // Income from payments
        const payments = await db.payment.findMany({
            where: {
                paidDate: { gte: start, lte: end },
                invoice: { lease: { landlordId } },
            },
        });
        const totalIncome = payments.reduce((sum, p) => sum + p.amountCents, 0) / 100;

        // Expenses
        const expenses = await db.expense.findMany({
            where: {
                landlordId,
                date: { gte: start, lte: end },
                status: 'APPROVED',
            },
        });
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amountCents, 0) / 100;

        data.push({
            month: monthLabel,
            ingresos: totalIncome,
            gastos: totalExpenses,
            beneficio: totalIncome - totalExpenses,
        });
    }

    return data;
}

/**
 * Get occupancy data for the last N months
 */
export async function getOccupancyData(landlordId: string, months: number = 6): Promise<OccupancyDataPoint[]> {
    const data: OccupancyDataPoint[] = [];
    const now = new Date();

    // Current total rooms (approximation - room count doesn't change dramatically)
    const totalRooms = await db.room.count({ where: { landlordId } });

    for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const end = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM yy', { locale: es });

        // Count active leases at end of month
        const activeLeases = await db.lease.findMany({
            where: {
                landlordId,
                status: 'ACTIVE',
                startDate: { lte: end },
                OR: [
                    { endDate: null },
                    { endDate: { gte: end } },
                ],
            },
            include: { rooms: true },
        });

        // Count unique occupied rooms
        const occupiedRoomIds = new Set<string>();
        activeLeases.forEach(lease => {
            lease.rooms.forEach(room => occupiedRoomIds.add(room.id));
        });

        const occupied = Math.min(occupiedRoomIds.size, totalRooms);
        const rate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

        data.push({
            month: monthLabel,
            ocupacion: rate,
            total: totalRooms,
            ocupadas: occupied,
        });
    }

    return data;
}

/**
 * Get expense breakdown by category
 */
export async function getExpenseBreakdown(landlordId: string, months: number = 6): Promise<ExpenseBreakdownItem[]> {
    const start = startOfMonth(subMonths(new Date(), months - 1));

    const expenses = await db.expense.findMany({
        where: {
            landlordId,
            date: { gte: start },
            status: 'APPROVED',
        },
    });

    // Group by category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(expense => {
        const cat = expense.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amountCents;
    });

    return Object.entries(categoryTotals)
        .map(([category, amountCents]) => ({
            category,
            label: CATEGORY_LABELS[category] || category,
            value: amountCents / 100,
            color: CATEGORY_COLORS[category] || '#6b7280',
        }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Get payment status distribution
 */
export async function getPaymentStatusData(landlordId: string, months: number = 6): Promise<PaymentStatusItem[]> {
    const start = startOfMonth(subMonths(new Date(), months - 1));

    const invoices = await db.invoice.findMany({
        where: {
            lease: { landlordId },
            dueDate: { gte: start },
        },
    });

    const statusMap = {
        PAID: { label: 'Pagadas', color: '#10b981', count: 0, amount: 0 },
        PENDING: { label: 'Pendientes', color: '#f59e0b', count: 0, amount: 0 },
        OVERDUE: { label: 'Vencidas', color: '#ef4444', count: 0, amount: 0 },
    };

    invoices.forEach(invoice => {
        const status = invoice.status as keyof typeof statusMap;
        if (statusMap[status]) {
            statusMap[status].count++;
            statusMap[status].amount += invoice.amountCents / 100;
        }
    });

    return Object.entries(statusMap).map(([status, data]) => ({
        status,
        ...data,
    }));
}

/**
 * Export dashboard data as CSV string
 */
export async function exportDashboardCSV(landlordId: string, months: number = 6): Promise<string> {
    const revenueData = await getRevenueData(landlordId, months);
    const expenseData = await getExpenseBreakdown(landlordId, months);
    const paymentData = await getPaymentStatusData(landlordId, months);

    let csv = 'INGRESOS Y GASTOS MENSUALES\n';
    csv += 'Mes,Ingresos (Bs),Gastos (Bs),Beneficio (Bs)\n';
    revenueData.forEach(d => {
        csv += `${d.month},${d.ingresos.toFixed(2)},${d.gastos.toFixed(2)},${d.beneficio.toFixed(2)}\n`;
    });

    csv += '\nDESGLOSE DE GASTOS\n';
    csv += 'Categoría,Total (Bs)\n';
    expenseData.forEach(d => {
        csv += `${d.label},${d.value.toFixed(2)}\n`;
    });

    csv += '\nESTADO DE PAGOS\n';
    csv += 'Estado,Cantidad,Monto Total (Bs)\n';
    paymentData.forEach(d => {
        csv += `${d.label},${d.count},${d.amount.toFixed(2)}\n`;
    });

    return csv;
}
