'use server'

import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { PaymentMethod, InvoiceStatus } from '@prisma/client';

/**
 * Tenant Action: Declare a payment for an invoice
 */
export async function declarePayment(invoiceId: string, method: PaymentMethod, notes?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // We should strictly query by tenant ownership for security, 
    // but for now we trust the UI + invoice ID existence check, or better:
    // Verify invoice belongs to a lease that belongs to the tenant.

    const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { lease: true }
    });

    if (!invoice) throw new Error("Invoice not found");

    // Simple ownership check: Invoice -> Lease -> Tenant
    // Since we don't have easy Tenant context in session (only UserId), 
    // and Lease -> TenantProfile -> UserId.
    // Let's verify:
    const tenantProfile = await db.tenantProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!tenantProfile) throw new Error("Tenant profile not found");
    if (invoice.lease.tenantId !== tenantProfile.id) throw new Error("Unauthorized access to this invoice");

    if (invoice.status === InvoiceStatus.PAID) throw new Error("Invoice already paid");

    await db.$transaction(async (tx) => {
        // Create Proof
        await tx.paymentProof.create({
            data: {
                invoiceId,
                method,
                notes: notes,
            }
        });

        // Update Invoice Status
        await tx.invoice.update({
            where: { id: invoiceId },
            data: { status: InvoiceStatus.PAYMENT_PROCESSING }
        });
    });

    revalidatePath('/invoices');
    revalidatePath(`/leases/${invoice.leaseId}`);
}

/**
 * Landlord Action: Approve a declared payment
 */
export async function approvePayment(proofId: string) {
    const landlordId = await getLandlordContext();

    const proof = await db.paymentProof.findFirst({
        where: {
            id: proofId,
            invoice: { lease: { landlordId } }
        },
        include: { invoice: true }
    });

    if (!proof) throw new Error("Proof not found");

    await db.$transaction(async (tx) => {
        // Create actual Payment record
        await tx.payment.create({
            data: {
                invoiceId: proof.invoiceId,
                amountCents: proof.invoice.amountCents,
                paidDate: new Date(), // Now
                method: proof.method,
                note: proof.notes ? `[Aprobado] ${proof.notes}` : "Pago aprobado manualmente",
            }
        });

        // Update Invoice to PAID
        await tx.invoice.update({
            where: { id: proof.invoiceId },
            data: {
                status: InvoiceStatus.PAID,
                paidAt: new Date(),
            }
        });

        // Optional: Delete proof or keep it? Plan didn't specify deletion.
        // Keeping it might duplicate info or be confusing if query later. 
        // But Relation is 1-1 Invoice-Proof properly defined logic? 
        // Schema: PaymentProof invoiceId @unique.
        // Let's keep it as history or delete it. 
        // If we keep it, we can't create another one if we ever revert.
        // Let's DELETE it upon approval to clean up 'pending' state, 
        // Since `Payment` record replaces it as the source of truth.
        await tx.paymentProof.delete({ where: { id: proofId } });
    });

    revalidatePath('/invoices');
}

/**
 * Landlord Action: Reject a declared payment
 */
export async function rejectPayment(proofId: string) {
    const landlordId = await getLandlordContext();

    const proof = await db.paymentProof.findFirst({
        where: {
            id: proofId,
            invoice: { lease: { landlordId } }
        },
        include: { invoice: true }
    });

    if (!proof) throw new Error("Proof not found");

    await db.$transaction(async (tx) => {
        // Revert Invoice Status
        // Determine if OVERDUE or PENDING
        const now = new Date();
        const isOverdue = proof.invoice.dueDate < now;

        await tx.invoice.update({
            where: { id: proof.invoiceId },
            data: { status: isOverdue ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING }
        });

        // Delete the proof so they can submit again
        await tx.paymentProof.delete({ where: { id: proofId } });
    });

    revalidatePath('/invoices');
}
