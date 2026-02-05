'use server'

import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { getNowInMadrid } from '@/lib/dates';
import { revalidatePath } from 'next/cache';

export async function markInvoicePaid(invoiceId: string, paymentMethod: 'CASH' | 'BIZUM' | 'BANK' | 'OTHER' = 'BANK') {
    await requireLandlord();

    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error("Invoice not found");
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
