'use server'

import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRoomSchema = z.object({
    name: z.string().min(1, "Name is required"),
    notes: z.string().optional(),
});

export async function createRoom(formData: FormData) {
    await requireLandlord();

    const data = {
        name: formData.get('name') as string,
        notes: formData.get('notes') as string,
    };

    const parsed = createRoomSchema.parse(data);

    await db.room.create({
        data: {
            name: parsed.name,
            notes: parsed.notes,
            status: 'AVAILABLE',
        },
    });

    revalidatePath('/rooms');
}

export async function deleteRoom(id: string) {
    await requireLandlord();

    // Check if active lease exists?
    // Prisma checks foreign key constraints usually, but cascading?
    // User said: "Lease ACTIVE = en MVP impedir (por validación) dos Lease ACTIVE para la misma Room."
    // And "Room status = al crear Lease ACTIVE...".
    // If we delete a room with leases, cascades might wipe data or fail.
    // Best to prevent deletion if Leases exist.

    const room = await db.room.findUnique({ where: { id }, include: { leases: true } });
    if (room && room.leases.length > 0) {
        throw new Error("Cannot delete room with history/leases.");
    }

    await db.room.delete({ where: { id } });
    revalidatePath('/rooms');
}
