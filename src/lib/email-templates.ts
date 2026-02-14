import { render } from '@react-email/render';
import InvoiceDueSoonEmail from '@/emails/invoice-due-soon';
import InvoiceOverdueEmail from '@/emails/invoice-overdue';
import ExpensePendingApprovalEmail from '@/emails/expense-pending-approval';
import { NotificationType } from '@prisma/client';

export interface EmailTemplateData {
    type: NotificationType;
    data: any;
}

/**
 * Render email template to HTML
 */
export async function renderEmailTemplate(template: EmailTemplateData): Promise<{ subject: string; html: string }> {
    const { type, data } = template;

    switch (type) {
        case NotificationType.INVOICE_DUE_SOON:
            return {
                subject: `Recordatorio: Tu factura vence en ${data.daysUntilDue} días`,
                html: await render(InvoiceDueSoonEmail(data)),
            };

        case NotificationType.INVOICE_OVERDUE:
            return {
                subject: `⚠️ Factura vencida - Acción requerida`,
                html: await render(InvoiceOverdueEmail(data)),
            };

        case NotificationType.EXPENSE_PENDING_APPROVAL:
            return {
                subject: `Nuevo gasto pendiente de aprobación - €${(data.amountCents / 100).toFixed(2)}`,
                html: await render(ExpensePendingApprovalEmail(data)),
            };

        default:
            throw new Error(`Unknown email template type: ${type}`);
    }
}
