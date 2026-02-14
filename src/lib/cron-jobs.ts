import cron from 'node-cron';
import { db } from '@/lib/db';
import { sendEmail, canSendEmail } from '@/lib/email';
import { renderEmailTemplate } from '@/lib/email-templates';
import { NotificationType, InvoiceStatus } from '@prisma/client';
import { addDays, differenceInDays, startOfDay } from 'date-fns';

/**
 * Check for invoices due in 3 days and send reminders
 * NOTE: This sends emails to ALL tenants across ALL landlords
 * Each landlord's tenants will receive their own reminders independently
 */
async function sendInvoiceDueReminders() {
    console.log('🔔 Checking for invoices due soon...');

    const threeDaysFromNow = addDays(startOfDay(new Date()), 3);
    const fourDaysFromNow = addDays(startOfDay(new Date()), 4);

    const invoices = await db.invoice.findMany({
        where: {
            status: InvoiceStatus.PENDING,
            dueDate: {
                gte: threeDaysFromNow,
                lt: fourDaysFromNow,
            },
            // Filter by lease to ensure multi-tenancy
            lease: {
                status: 'ACTIVE', // Only active leases
            },
        },
        include: {
            lease: {
                include: {
                    tenant: {
                        include: {
                            user: true,
                        },
                    },
                    landlord: true, // Include landlord for logging
                },
            },
        },
    });

    console.log(`Found ${invoices.length} invoices due in 3 days across all landlords`);

    for (const invoice of invoices) {
        const userId = invoice.lease.tenant.userId;
        const landlordEmail = invoice.lease.landlord.email;

        const canSend = await canSendEmail(userId, NotificationType.INVOICE_DUE_SOON);

        if (!canSend) {
            console.log(`⏭️  Skipping reminder for ${invoice.lease.tenant.fullName} (landlord: ${landlordEmail}) - notifications disabled`);
            continue;
        }

        const { subject, html } = await renderEmailTemplate({
            type: NotificationType.INVOICE_DUE_SOON,
            data: {
                tenantName: invoice.lease.tenant.fullName,
                amountCents: invoice.amountCents,
                dueDate: invoice.dueDate.toLocaleDateString('es-ES'),
                daysUntilDue: 3,
                invoiceUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/me/invoices` : undefined,
            },
        });

        await sendEmail({
            to: invoice.lease.tenant.user.email,
            subject,
            html,
            type: NotificationType.INVOICE_DUE_SOON,
            recipientId: userId,
            metadata: { invoiceId: invoice.id, landlordId: invoice.lease.landlordId },
        });

        console.log(`✅ Sent due soon reminder to ${invoice.lease.tenant.fullName} (landlord: ${landlordEmail})`);
    }
}

/**
 * Check for overdue invoices and send reminders
 * NOTE: This sends emails to ALL tenants across ALL landlords
 * Each landlord's tenants will receive their own reminders independently
 */
async function sendOverdueInvoiceReminders() {
    console.log('🔔 Checking for overdue invoices...');

    const today = startOfDay(new Date());

    const invoices = await db.invoice.findMany({
        where: {
            status: InvoiceStatus.OVERDUE,
            dueDate: {
                lt: today,
            },
            // Filter by lease to ensure multi-tenancy
            lease: {
                status: 'ACTIVE', // Only active leases
            },
        },
        include: {
            lease: {
                include: {
                    tenant: {
                        include: {
                            user: true,
                        },
                    },
                    landlord: true, // Include landlord for logging
                },
            },
        },
    });

    console.log(`Found ${invoices.length} overdue invoices across all landlords`);

    for (const invoice of invoices) {
        const userId = invoice.lease.tenant.userId;
        const landlordEmail = invoice.lease.landlord.email;

        const canSend = await canSendEmail(userId, NotificationType.INVOICE_OVERDUE);

        if (!canSend) {
            console.log(`⏭️  Skipping overdue reminder for ${invoice.lease.tenant.fullName} (landlord: ${landlordEmail}) - notifications disabled`);
            continue;
        }

        const daysOverdue = differenceInDays(today, invoice.dueDate);

        // Only send weekly reminders (every 7 days)
        if (daysOverdue % 7 !== 0) {
            continue;
        }

        const { subject, html } = await renderEmailTemplate({
            type: NotificationType.INVOICE_OVERDUE,
            data: {
                tenantName: invoice.lease.tenant.fullName,
                amountCents: invoice.amountCents,
                dueDate: invoice.dueDate.toLocaleDateString('es-ES'),
                daysOverdue,
                invoiceUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/me/invoices` : undefined,
            },
        });

        await sendEmail({
            to: invoice.lease.tenant.user.email,
            subject,
            html,
            type: NotificationType.INVOICE_OVERDUE,
            recipientId: userId,
            metadata: { invoiceId: invoice.id, daysOverdue, landlordId: invoice.lease.landlordId },
        });

        console.log(`✅ Sent overdue reminder to ${invoice.lease.tenant.fullName} (${daysOverdue} days overdue, landlord: ${landlordEmail})`);
    }
}

/**
 * Send notifications for pending expense approvals
 */
async function sendExpenseApprovalReminders() {
    console.log('🔔 Checking for pending expense approvals...');

    const expenses = await db.expense.findMany({
        where: {
            status: 'PENDING',
        },
        include: {
            landlord: true,
            room: true,
        },
    });

    // Group by landlord
    const expensesByLandlord = expenses.reduce((acc, expense) => {
        if (!acc[expense.landlordId]) {
            acc[expense.landlordId] = [];
        }
        acc[expense.landlordId].push(expense);
        return acc;
    }, {} as Record<string, typeof expenses>);

    for (const [landlordId, landlordExpenses] of Object.entries(expensesByLandlord)) {
        const canSend = await canSendEmail(landlordId, NotificationType.EXPENSE_PENDING_APPROVAL);

        if (!canSend) {
            console.log(`⏭️  Skipping expense reminder for landlord (notifications disabled)`);
            continue;
        }

        // Send one email per pending expense
        for (const expense of landlordExpenses) {
            const { subject, html } = await renderEmailTemplate({
                type: NotificationType.EXPENSE_PENDING_APPROVAL,
                data: {
                    landlordName: expense.landlord.email.split('@')[0], // Simple name extraction
                    description: expense.description,
                    amountCents: expense.amountCents,
                    category: expense.category,
                    propertyName: expense.room?.name,
                    expenseUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/expenses` : undefined,
                },
            });

            await sendEmail({
                to: expense.landlord.email,
                subject,
                html,
                type: NotificationType.EXPENSE_PENDING_APPROVAL,
                recipientId: landlordId,
                metadata: { expenseId: expense.id },
            });

            console.log(`✅ Sent expense approval reminder to landlord (${expense.landlord.email})`);
        }
    }
}

/**
 * Initialize cron jobs
 */
export function initializeCronJobs() {
    if (process.env.ENABLE_CRON_JOBS !== 'true') {
        console.log('⏸️  Cron jobs disabled (set ENABLE_CRON_JOBS=true to enable)');
        return;
    }

    console.log('🚀 Initializing cron jobs...');

    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running daily notification checks...');
        try {
            await sendInvoiceDueReminders();
            await sendOverdueInvoiceReminders();
            await sendExpenseApprovalReminders();
            console.log('✅ Daily notification checks completed');
        } catch (error) {
            console.error('❌ Error running daily notifications:', error);
        }
    });

    console.log('✅ Cron jobs initialized');
    console.log('   - Invoice due reminders: Daily at 9:00 AM');
    console.log('   - Overdue invoice reminders: Daily at 9:00 AM');
    console.log('   - Expense approval reminders: Daily at 9:00 AM');
}
