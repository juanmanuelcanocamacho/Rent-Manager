'use server'

import { db } from '@/lib/db';
import { requireLandlord, requireTenant, getSessionUser, getTenantProfileForSession } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function createMessage(formData: FormData) {
    const tenantProfile = await getTenantProfileForSession();

    // Find active lease to link? 
    // Prompt: "Message ... leaseId (FK Lease)".
    // Tenant might have multiple Leases? Unlikely in MVP but possible (historical).
    // Link to ACTIVE lease.
    const lease = await db.lease.findFirst({
        where: { tenantId: tenantProfile.id, status: 'ACTIVE' }
    });

    if (!lease) {
        throw new Error("No active lease found to create ticket.");
    }

    const content = formData.get('content') as string;
    if (!content) throw new Error("Content required");

    await db.message.create({
        data: {
            leaseId: lease.id,
            tenantId: tenantProfile.id,
            content: content,
            status: 'OPEN',
        }
    });

    revalidatePath('/me/messages');
    revalidatePath('/reports');
}

export async function replyMessage(messageId: string, reply: string) {
    await requireLandlord();

    await db.message.update({
        where: { id: messageId },
        data: {
            adminReply: reply,
            repliedAt: new Date(),
            // status: 'CLOSED'? Optional. Usually reply doesn't close defined by prompt "responder + cerrar".
        }
    });

    revalidatePath('/reports');
    revalidatePath('/me/messages');
}

export async function closeMessage(messageId: string) {
    await requireLandlord();
    await db.message.update({
        where: { id: messageId },
        data: { status: 'CLOSED' }
    });
    revalidatePath('/reports');
    revalidatePath('/me/messages'); // Tenant sees closed
}
