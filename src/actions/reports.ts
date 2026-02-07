'use server';

import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Prisma } from '@prisma/client';

export type ReportFilter = {
    tenantId?: string | 'ALL';
    status?: 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE';
    startDate?: Date;
    endDate?: Date;
};

export async function getInvoicesForReport(filter: ReportFilter) {
    await requireLandlord();

    const where: Prisma.InvoiceWhereInput = {};

    if (filter.tenantId && filter.tenantId !== 'ALL') {
        where.lease = {
            tenantId: filter.tenantId
        };
    }

    if (filter.status && filter.status !== 'ALL') {
        if (filter.status === 'PENDING') {
            // Also include OVERDUE if user asks for PENDING? Or separate?
            // Usually "Unpaid" covers both. Let's assume strict status matching for now.
            // Or maybe complex logic: Pending means not paid.
            // If the user selects "PENDING" in UI, we might want Pending + Overdue?
            // Let's match exact status for now.
            where.status = filter.status;
        } else {
            where.status = filter.status;
        }
    }

    if (filter.startDate || filter.endDate) {
        where.dueDate = {};
        if (filter.startDate) where.dueDate.gte = filter.startDate;
        if (filter.endDate) where.dueDate.lte = filter.endDate;
    }

    const invoices = await db.invoice.findMany({
        where,
        include: {
            lease: {
                include: {
                    tenant: true,
                    rooms: true
                }
            }
        },
        orderBy: {
            dueDate: 'asc'
        }
    });

    // Serialize dates for client
    return invoices.map(inv => ({
        ...inv,
        dueDate: inv.dueDate.toISOString(),
        paidAt: inv.paidAt?.toISOString() || null,
        createdAt: inv.createdAt.toISOString(),
        lease: {
            ...inv.lease,
            startDate: inv.lease.startDate.toISOString(),
            endDate: inv.lease.endDate?.toISOString() || null,
            tenant: {
                ...inv.lease.tenant,
                createdAt: inv.lease.tenant.createdAt.toISOString()
            }
        }
    }));
}
