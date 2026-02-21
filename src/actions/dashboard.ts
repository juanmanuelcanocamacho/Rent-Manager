'use server';

import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { Role } from '@prisma/client';

// Generate last 6 months list to perform queries against
export async function getDashboardData() {
    const user = await requireManagementAccess();
    const isLandlord = user.role === Role.LANDLORD;
    const landlordId = await getLandlordContext();
    const country = ((user as any).country as 'SPAIN' | 'BOLIVIA') || 'BOLIVIA';

    const now = new Date();

    // --- 1. KPI Cards data (MoM Comparisons) ---
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Expenses
    const currentMonthExpenses = await db.expense.aggregate({
        where: { landlordId, date: { gte: startOfCurrentMonth } },
        _sum: { amountCents: true }
    });
    const previousMonthExpenses = await db.expense.aggregate({
        where: { landlordId, date: { gte: startOfPreviousMonth, lt: startOfCurrentMonth } },
        _sum: { amountCents: true }
    });

    // Income
    const currentMonthIncome = await db.payment.aggregate({
        where: { invoice: { lease: { landlordId } }, paidDate: { gte: startOfCurrentMonth } },
        _sum: { amountCents: true }
    });
    const previousMonthIncome = await db.payment.aggregate({
        where: { invoice: { lease: { landlordId } }, paidDate: { gte: startOfPreviousMonth, lt: startOfCurrentMonth } },
        _sum: { amountCents: true }
    });

    const currentIncomeCents = currentMonthIncome._sum.amountCents || 0;
    const currentExpensesCents = currentMonthExpenses._sum.amountCents || 0;
    const currentProfitCents = currentIncomeCents - currentExpensesCents;

    const previousIncomeCents = previousMonthIncome._sum.amountCents || 0;
    const previousExpensesCents = previousMonthExpenses._sum.amountCents || 0;
    const previousProfitCents = previousIncomeCents - previousExpensesCents;

    const getMoMChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const profitMom = getMoMChange(currentProfitCents, previousProfitCents);

    // Occupancy
    const roomsTotal = await db.room.count({ where: { landlordId } });
    const roomsOccupied = await db.room.count({ where: { landlordId, status: 'OCCUPIED' } });
    const occupancyRate = roomsTotal > 0 ? Math.round((roomsOccupied / roomsTotal) * 100) : 0;

    // Due coming 7 days
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const pendingInvoices = await db.invoice.findMany({
        where: { status: 'PENDING', dueDate: { lte: nextWeek, gte: now }, lease: { landlordId } }
    });
    const nextWeekIncomeCents = pendingInvoices.reduce((acc, curr) => acc + curr.amountCents, 0);

    // Overdue Support
    const overdueInvoices = await db.invoice.findMany({
        where: { status: 'OVERDUE', lease: { landlordId } },
        include: { lease: { include: { tenant: true } } }
    });
    const overdueSumCents = overdueInvoices.reduce((acc, curr) => acc + curr.amountCents, 0);

    // --- 2. Revenue Chart Data (Last 6 Months) ---
    const monthlyData = [];
    const chartLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const mIncome = await db.payment.aggregate({
            where: { invoice: { lease: { landlordId } }, paidDate: { gte: monthStart, lte: monthEnd } },
            _sum: { amountCents: true }
        });

        const mExpense = await db.expense.aggregate({
            where: { landlordId, date: { gte: monthStart, lte: monthEnd } },
            _sum: { amountCents: true }
        });

        monthlyData.push({
            name: `${chartLabels[monthStart.getMonth()]} ${monthStart.getFullYear().toString().substring(2)}`,
            ingresos: (mIncome._sum.amountCents || 0) / 100, // For charts we use full numbers generally, not cents
            gastos: (mExpense._sum.amountCents || 0) / 100,
        });
    }

    // --- 3. Expense Breakdown Chart (Current Month) ---
    const rawCategoryExpenses = await db.expense.groupBy({
        by: ['category'],
        where: { landlordId, date: { gte: startOfCurrentMonth } },
        _sum: { amountCents: true }
    });

    const categoryTranslations: Record<string, string> = {
        MAINTENANCE: 'Mantenimiento',
        UTILITIES: 'Servicios',
        INSURANCE: 'Seguros',
        TAXES: 'Impuestos',
        OTHER: 'Otros'
    };

    // Colors for the donut chart
    const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

    const expenseBreakdownData = rawCategoryExpenses.map((expense, index) => ({
        name: categoryTranslations[expense.category] || expense.category,
        value: (expense._sum.amountCents || 0) / 100,
        color: categoryColors[index % categoryColors.length]
    })).filter(x => x.value > 0);

    // --- 4. Recent Activity Feed ---
    const rawPayments = await db.payment.findMany({
        where: { invoice: { lease: { landlordId } } },
        include: { invoice: { include: { lease: { include: { tenant: true, rooms: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const rawExpenses = await db.expense.findMany({
        where: { landlordId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const rawLeases = await db.lease.findMany({
        where: { landlordId },
        include: { tenant: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const activities = [];

    for (const p of rawPayments) {
        activities.push({
            id: `pay-${p.id}`,
            type: 'PAYMENT',
            date: p.createdAt,
            title: `Pago recibido de ${p.invoice.lease.tenant.fullName}`,
            description: `Se recibió un pago de ${(p.amountCents / 100).toFixed(2)} mediante ${p.method}.`
        });
    }

    for (const e of rawExpenses) {
        activities.push({
            id: `exp-${e.id}`,
            type: 'EXPENSE',
            date: e.createdAt,
            title: `Nuevo gasto registrado`,
            description: `Gasto de ${(e.amountCents / 100).toFixed(2)} en la categoría ${categoryTranslations[e.category] || e.category}.`
        });
    }

    for (const l of rawLeases) {
        activities.push({
            id: `lea-${l.id}`,
            type: 'LEASE_CREATED',
            date: l.createdAt,
            title: `Nuevo contrato con ${l.tenant.fullName}`,
            description: `Contrato iniciado el ${l.startDate.toLocaleDateString('es-ES')}`
        });
    }

    // Sort all combined activities and take the newest 6
    // Sort all combined activities and take the newest 6
    const recentActivity = activities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 6);

    return {
        country,
        kpis: {
            currentProfitCents,
            profitMom,
            overdueSumCents,
            overdueCount: overdueInvoices.length,
            nextWeekIncomeCents,
            nextWeekIncomeCount: pendingInvoices.length,
            occupancyRate,
            roomsOccupied,
            roomsTotal
        },
        overdueInvoices,
        chartData: {
            monthly: monthlyData,
            expensesBreakdown: expenseBreakdownData,
        },
        recentActivity,
        isLandlord
    };
}

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateCopilotSummary() {
    const user = await requireManagementAccess();
    if (user.role !== Role.LANDLORD) {
        return "El asistente Copilot solo está disponible para propietarios.";
    }

    const landlordId = await getLandlordContext();
    const country = ((user as any).country as 'SPAIN' | 'BOLIVIA') || 'BOLIVIA';
    const currency = country === 'SPAIN' ? 'EUR' : 'BOB';

    try {
        // 1. Fetch Tenant Debt Data
        const allTenants = await db.tenantProfile.findMany({
            where: { landlordId },
            include: {
                leases: {
                    where: { status: 'ACTIVE' },
                    include: {
                        invoices: {
                            where: { status: { in: ['PENDING', 'OVERDUE'] } }
                        }
                    }
                }
            }
        });

        // 2. Build the factual context string
        let contextText = `Datos actuales de inquilinos y sus deudas:\n\n`;
        let hasDebts = false;
        let totalDebtCents = 0;

        for (const tenant of allTenants) {
            let tenantDebtCents = 0;
            const overdueMonths: string[] = [];

            for (const lease of tenant.leases) {
                for (const invoice of lease.invoices) {
                    if (invoice.status === 'OVERDUE') {
                        tenantDebtCents += invoice.amountCents;
                        overdueMonths.push(invoice.dueDate.toLocaleDateString('es-ES', { month: 'long' }));
                        hasDebts = true;
                    }
                }
            }

            totalDebtCents += tenantDebtCents;

            if (tenantDebtCents > 0) {
                contextText += `- ${tenant.fullName}: Debe ${(tenantDebtCents / 100).toFixed(2)} ${currency} correspondientes a los meses de ${overdueMonths.join(', ')}.\n`;
            }
        }

        if (!hasDebts) {
            contextText += "No hay ningún inquilino con facturas vencidas. Todos están al día.\n";
        } else {
            contextText += `\nDeuda total acumulada: ${(totalDebtCents / 100).toFixed(2)} ${currency}.\n`;
        }

        // 3. Request AI Summary
        const systemPrompt = `Eres Llavia Copilot, el asistente inteligente financiero de un administrador de propiedades (Propietario).
        Tu objetivo es leer un resumen crudo de datos de inquilinos y escribir un párrafo ejecutivo, directo, y muy amable (empático pero profesional) para que el propietario lo lea en su Dashboard.
        
        Reglas estrictas:
        - Si no hay deudas, felicita al propietario brevemente ('¡Felicidades! Todos tus inquilinos están al día.').
        - Si hay deudas, resume quién debe y cuánto deben sin hacer una lista aburrida. Agrupa si es posible. Termina sugiriendo tomar acción en la pestaña de facturación.
        - Sé MUY conciso. Máximo 2-3 frases (aprox 40-50 palabras). El widget es pequeño.
        - Usa un tono alentador y profesional. Nunca regañes al propietario.`;

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            system: systemPrompt,
            prompt: contextText,
        });

        return text;

    } catch (error) {
        console.error("AI Generation Error: ", error);
        return "Llavia Copilot no está disponible en este momento. Por favor, verifica la configuración de tu OpenAI API Key.";
    }
}
