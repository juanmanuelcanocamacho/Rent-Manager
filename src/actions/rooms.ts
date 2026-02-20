'use server'

import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRoomSchema = z.object({
    name: z.string().min(1, "Name is required"),
    notes: z.string().optional(),
});

export async function createRoom(formData: FormData) {
    const landlordId = await getLandlordContext();

    const data = {
        name: formData.get('name') as string,
        notes: formData.get('notes') as string,
    };

    const parsed = createRoomSchema.parse(data);

    await db.room.create({
        data: {
            landlordId: landlordId,
            name: parsed.name,
            notes: parsed.notes,
            status: 'AVAILABLE',
        },
    });

    revalidatePath('/rooms');
}

export async function deleteRoom(id: string) {
    const landlordId = await getLandlordContext();

    const room = await db.room.findUnique({
        where: { id_landlordId: { id, landlordId } },
        include: { leases: true }
    });

    if (!room) {
        throw new Error("Room not found or you don't have permission.");
    }

    if (room.leases.length > 0) {
        throw new Error("Cannot delete room with history/leases.");
    }

    await db.room.delete({
        where: { id_landlordId: { id, landlordId } }
    });
    revalidatePath('/rooms');
}

export async function bulkCreateRooms(roomsData: any[]) {
    const landlordId = await getLandlordContext();

    await db.$transaction(async (tx) => {
        for (const roomData of roomsData) {
            // Use a flexible approach by searching keys similar to name/nombre
            const NameFieldname = Object.keys(roomData).find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name'));
            const NotesFieldname = Object.keys(roomData).find(k => k.toLowerCase().includes('nota') || k.toLowerCase().includes('note'));

            const data = {
                name: NameFieldname ? roomData[NameFieldname] : undefined,
                notes: NotesFieldname ? roomData[NotesFieldname] : undefined,
            };

            if (!data.name) {
                throw new Error("El nombre de la propiedad es obligatorio en todas las filas.");
            }

            const parsed = createRoomSchema.parse(data);

            await tx.room.create({
                data: {
                    landlordId: landlordId,
                    name: parsed.name,
                    notes: parsed.notes,
                    status: 'AVAILABLE',
                },
            });
        }
    });

    revalidatePath('/rooms');
}
