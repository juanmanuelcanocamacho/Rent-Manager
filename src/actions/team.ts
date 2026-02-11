'use server';

import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { hash } from 'bcryptjs'; // Using bcryptjs directly if hashPassword not exported?
// actually checking auth.ts to see what is exported.
// If hashPassword is not exported, I should check src/lib/auth.ts
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export async function createManager(formData: FormData) {
    const landlordId = await getLandlordContext();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        throw new Error('Faltan campos obligatorios');
    }

    const passwordHash = await hash(password, 10);

    await db.user.create({
        data: {
            email,
            passwordHash,
            role: Role.MANAGER,
            landlordId: landlordId,
        }
    });

    revalidatePath('/team');
}

export async function deleteManager(id: string) {
    const landlordId = await getLandlordContext();

    // Prevent deleting self (though requireLandlord checks current user)
    // Prevent deleting other landlords?
    // Just simple delete for now.

    const user = await db.user.findFirst({
        where: { id, landlordId: landlordId }
    });
    if (!user || user.role !== Role.MANAGER) {
        throw new Error("Solo se pueden borrar encargados");
    }

    await db.user.delete({
        where: { id }
    });

    revalidatePath('/team');
}
