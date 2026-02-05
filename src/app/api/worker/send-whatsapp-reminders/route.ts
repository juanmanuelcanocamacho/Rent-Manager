import { db } from '@/lib/db';
import { getNowInMadrid, formatParamDate } from '@/lib/dates';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { formatMoney } from '@/lib/money';
import { NotificationType } from '@prisma/client';

export async function POST(request: Request) {
    const secret = request.headers.get('x-worker-secret');
    if (secret !== process.env.WORKER_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = getNowInMadrid();
    const sendDate = today; // Normalized for idempotency
    let logs = [];

    // 1. Reminder 3 Days Before
    // dueDate = today + 3 days
    const date3Days = new Date(today);
    date3Days.setDate(today.getDate() + 3);

    const dueIn3Days = await db.invoice.findMany({
        where: {
            dueDate: date3Days,
            status: 'PENDING',
            lease: { tenant: { whatsappOptIn: true } }
        },
        include: { lease: { include: { tenant: true } } }
    });

    for (const inv of dueIn3Days) {
        await processNotification(inv, 'REMINDER_3D', sendDate,
            `Hola ${inv.lease.tenant.fullName}, recordatorio: tu cuota de ${formatMoney(inv.amountCents)} vence el ${inv.dueDate.toLocaleDateString()}. Gracias.`);
    }

    // 2. Due Today
    // dueDate = today
    const dueToday = await db.invoice.findMany({
        where: {
            dueDate: today,
            status: 'PENDING',
            lease: { tenant: { whatsappOptIn: true } }
        },
        include: { lease: { include: { tenant: true } } }
    });

    for (const inv of dueToday) {
        await processNotification(inv, 'DUE_TODAY', sendDate,
            `Hola ${inv.lease.tenant.fullName}, hoy vence tu cuota de ${formatMoney(inv.amountCents)} (${inv.dueDate.toLocaleDateString()}). Gracias.`);
    }

    // 3. Weekly Overdue Summary (Mondays)
    // Check if today is Monday (1)
    if (today.getDay() === 1) {
        // Find leases with ANY overdue invoices
        const activeLeases = await db.lease.findMany({
            where: { status: 'ACTIVE', tenant: { whatsappOptIn: true } },
            include: { tenant: true, invoices: { where: { status: 'OVERDUE' } } }
        });

        for (const lease of activeLeases) {
            if (lease.invoices.length > 0) {
                const totalDebt = lease.invoices.reduce((sum, i) => sum + i.amountCents, 0);
                const datesList = lease.invoices.map(i => `${i.dueDate.toLocaleDateString()} (${formatMoney(i.amountCents)})`).join(', ');

                await processReviewNotification(lease, 'OVERDUE_WEEKLY', sendDate,
                    `Hola ${lease.tenant.fullName}, tienes una deuda pendiente total de ${formatMoney(totalDebt)}. Cuotas vencidas: ${datesList}. Por favor regulariza cuando puedas.`);
            }
        }
    }

    return NextResponse.json({ success: true, processed: true });
}

// Helper for Invoice-based notifications
async function processNotification(invoice: any, type: NotificationType, sendDate: Date, message: string) {
    // Idempotency Check
    const existing = await db.notificationLog.findFirst({
        where: { invoiceId: invoice.id, type, sendDate }
    });

    if (existing) return;

    let status = 'SENT';
    let error = null;
    let sid = null;

    try {
        sid = await sendWhatsAppMessage(invoice.lease.tenant.phoneE164, message);
    } catch (e: any) {
        status = 'FAILED';
        error = e.message;
    }

    await db.notificationLog.create({
        data: {
            leaseId: invoice.leaseId,
            invoiceId: invoice.id,
            type,
            toPhone: invoice.lease.tenant.phoneE164,
            payloadJson: { message },
            sendDate,
            status: status as any,
            error,
            providerMessageId: sid
        }
    });
}

// Helper for Lease-based notifications (Weekly)
async function processReviewNotification(lease: any, type: NotificationType, sendDate: Date, message: string) {
    // Idempotency: use leaseId + type + sendDate (invoiceId is null)
    const existing = await db.notificationLog.findFirst({
        where: { leaseId: lease.id, type, sendDate } // assumes unique index works or logic sufficient
    });

    if (existing) return;

    let status = 'SENT';
    let error = null;
    let sid = null;

    try {
        sid = await sendWhatsAppMessage(lease.tenant.phoneE164, message);
    } catch (e: any) {
        status = 'FAILED';
        error = e.message;
    }

    await db.notificationLog.create({
        data: {
            leaseId: lease.id,
            invoiceId: null,
            type,
            toPhone: lease.tenant.phoneE164,
            payloadJson: { message },
            sendDate,
            status: status as any,
            error,
            providerMessageId: sid
        }
    });
}
