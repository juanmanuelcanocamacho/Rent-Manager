'use server'

import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { addMonths, calculateDueDate, getNowInMadrid, toMadridDate } from '@/lib/dates';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createLeaseSchema = z.object({
    roomIds: z.array(z.string().min(1)),
    tenantId: z.string().min(1),
    startDate: z.string(), // YYYY-MM-DD
    rentAmount: z.coerce.number().min(0),
    duration: z.coerce.number().min(1).optional(),
});

export async function createLease(formData: FormData) {
    await requireLandlord();

    const rawData = {
        roomIds: formData.getAll('roomIds'),
        tenantId: formData.get('tenantId'),
        startDate: formData.get('startDate'),
        rentAmount: formData.get('rentAmountCents'),
        duration: formData.get('duration'),
    };

    const parsed = createLeaseSchema.parse(rawData);
    const rentAmountCents = Math.round(parsed.rentAmount * 100);
    const startDate = toMadridDate(new Date(parsed.startDate));
    const billingDay = startDate.getDate();
    const monthsAhead = parsed.duration || 12;

    // Validate Rooms Availability
    const rooms = await db.room.findMany({ where: { id: { in: parsed.roomIds } } });

    if (rooms.length !== parsed.roomIds.length) {
        throw new Error("One or more rooms not found.");
    }

    const occupiedRooms = rooms.filter(r => r.status !== 'AVAILABLE');
    if (occupiedRooms.length > 0) {
        throw new Error(`Rooms ${occupiedRooms.map(r => r.name).join(', ')} are not available.`);
    }

    await db.$transaction(async (tx) => {
        // 1. Create Lease
        const lease = await tx.lease.create({
            data: {
                rooms: {
                    connect: parsed.roomIds.map(id => ({ id }))
                },
                tenantId: parsed.tenantId,
                startDate: startDate,
                rentAmountCents: rentAmountCents,
                billingDay: billingDay,
                status: 'ACTIVE',
            },
        });

        // 2. Update Rooms Status
        await tx.room.updateMany({
            where: { id: { in: parsed.roomIds } },
            data: { status: 'OCCUPIED' },
        });

        // 3. Generate Invoices
        const invoicesData = [];
        const today = getNowInMadrid();

        for (let i = 1; i <= monthsAhead; i++) {
            const targetDate = addMonths(startDate, i);
            const dueDate = calculateDueDate(targetDate.getFullYear(), targetDate.getMonth(), billingDay);

            let status: 'PENDING' | 'OVERDUE' | 'PAID' = 'PENDING';
            if (dueDate < today) {
                status = 'OVERDUE';
            }

            invoicesData.push({
                leaseId: lease.id,
                dueDate: dueDate,
                amountCents: rentAmountCents,
                status: status,
            });
        }

        await tx.invoice.createMany({
            data: invoicesData,
        });
    });

    revalidatePath('/leases');
    revalidatePath('/rooms');
}

export async function endLease(leaseId: string) {
    await requireLandlord();

    await db.$transaction(async (tx) => {
        const lease = await tx.lease.findUnique({
            where: { id: leaseId },
            include: { rooms: true }
        });
        if (!lease) throw new Error("Lease not found");

        await tx.lease.update({
            where: { id: leaseId },
            data: {
                status: 'ENDED',
                endDate: getNowInMadrid(), // Set end date to now
            }
        });

        if (lease.rooms.length > 0) {
            await tx.room.updateMany({
                where: { id: { in: lease.rooms.map(r => r.id) } },
                data: { status: 'AVAILABLE' }
            });
        }
    });

    revalidatePath('/rooms');
}

export async function deleteLease(leaseId: string) {
    await requireLandlord();

    await db.$transaction(async (tx) => {
        const lease = await tx.lease.findUnique({
            where: { id: leaseId },
            include: { rooms: true }
        });
        if (!lease) throw new Error("Lease not found");

        // 1. Delete linked Invoice records (Payments, NotificationLogs)
        const invoices = await tx.invoice.findMany({ where: { leaseId } });
        const invoiceIds = invoices.map(i => i.id);

        if (invoiceIds.length > 0) {
            await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
            await tx.notificationLog.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        }

        // 2. Delete Invoices and other Lease linked records
        await tx.invoice.deleteMany({ where: { leaseId } });
        await tx.message.deleteMany({ where: { leaseId } });
        await tx.notificationLog.deleteMany({ where: { leaseId } });

        // 3. Delete Lease
        await tx.lease.delete({ where: { id: leaseId } });

        // 4. Update Rooms Status
        if (lease.status === 'ACTIVE' && lease.rooms.length > 0) {
            await tx.room.updateMany({
                where: { id: { in: lease.rooms.map(r => r.id) } },
                data: { status: 'AVAILABLE' }
            });
        }
    });

    revalidatePath('/leases');
    revalidatePath('/rooms');
    revalidatePath('/invoices');
}

export async function updateLease(formData: FormData) {
    await requireLandlord();

    const id = formData.get('id') as string;
    const endDateStr = formData.get('endDate') as string;
    const rentAmount = Number(formData.get('rentAmountCents'));
    const billingDay = Number(formData.get('billingDay'));
    const status = formData.get('status') as 'ACTIVE' | 'ENDED';
    const notes = formData.get('notes') as string;

    if (!id) throw new Error("Lease ID required");

    // Optional: Date validation
    const endDate = endDateStr ? toMadridDate(new Date(endDateStr)) : null;

    await db.lease.update({
        where: { id },
        data: {
            endDate,
            rentAmountCents: Math.round(rentAmount * 100),
            billingDay,
            status,
            // notes: notes ?? // Schema doesn't have notes on Lease yet? Let's check schema.
        }
    });

    revalidatePath('/leases');
    revalidatePath(`/leases/${id}`);
    redirect('/leases');
}
