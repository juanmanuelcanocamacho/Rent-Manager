'use server'

import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { getNowInMadrid } from '@/lib/dates';
import { revalidatePath } from 'next/cache';

export async function markInvoicePaid(invoiceId: string, paymentMethod: 'CASH' | 'BIZUM' | 'BANK' | 'OTHER' = 'BANK') {
    const landlordId = await getLandlordContext();

    const invoice = await db.invoice.findFirst({
        where: {
            id: invoiceId,
            lease: { landlordId: landlordId }
        }
    });
    if (!invoice) throw new Error("Invoice not found or unauthorized");
    if (invoice.status === 'PAID') throw new Error("Already paid");

    await db.$transaction(async (tx) => {
        // Update Invoice
        await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paidAt: getNowInMadrid(),
            }
        });

        // Create Payment Record
        await tx.payment.create({
            data: {
                invoiceId: invoiceId,
                amountCents: invoice.amountCents,
                paidDate: getNowInMadrid(),
                method: paymentMethod,
            }
        });
    });

    revalidatePath('/invoices');
}

export async function unmarkInvoicePaid(invoiceId: string) {
    const landlordId = await getLandlordContext();

    const invoice = await db.invoice.findFirst({
        where: {
            id: invoiceId,
            lease: { landlordId: landlordId }
        }
    });
    if (!invoice) throw new Error("Invoice not found or unauthorized");
    if (invoice.status !== 'PAID') throw new Error("Invoice is not paid");

    await db.$transaction(async (tx) => {
        // Determine correct status (PENDING or OVERDUE)
        const now = getNowInMadrid();
        let newStatus: 'PENDING' | 'OVERDUE' = 'PENDING';
        if (invoice.dueDate < now) {
            newStatus = 'OVERDUE';
        }

        // Update Invoice
        await tx.invoice.update({
            where: { id: invoiceId },
            data: {
                status: newStatus,
                paidAt: null,
            }
        });

        // Delete Payment Record
        await tx.payment.delete({
            where: { invoiceId: invoiceId }
        });
    });

    revalidatePath('/invoices');
}
