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
    const username = (formData.get('username') as string)?.toLowerCase().trim();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    // Normalize empty strings to null for optional unique fields
    const emailNorm = email?.trim() || null;
    const usernameNorm = username?.trim() || null;
    const nameNorm = name?.trim() || null;
    const phoneNorm = phone?.trim() || null;

    if (!password || (!emailNorm && !usernameNorm)) {
        throw new Error('Debes proporcionar al menos un Email o un Usuario, y una Contraseña');
    }

    if (usernameNorm) {
        // Check for duplicate username
        const existingUsername = await db.user.findFirst({
            where: { username: usernameNorm }
        });
        if (existingUsername) {
            throw new Error('El nombre de usuario ya está en uso');
        }
    }

    if (emailNorm) {
        // Check for duplicate email
        const existingEmail = await db.user.findUnique({
            where: { email: emailNorm }
        });
        if (existingEmail) {
            throw new Error('El email ya está en uso');
        }
    }

    const passwordHash = await hash(password, 10);

    await db.user.create({
        data: {
            email: emailNorm,
            username: usernameNorm,
            name: nameNorm,
            phone: phoneNorm,
            passwordHash,
            role: Role.MANAGER,
            landlordId: landlordId,
        }
    });

    revalidatePath('/team');
}

export async function deleteManager(id: string) {
    try {
        const landlordId = await getLandlordContext();

        const user = await db.user.findFirst({
            where: { id, landlordId: landlordId }
        });
        if (!user || user.role !== Role.MANAGER) {
            throw new Error("No tienes permisos para eliminar este usuario o no es un encargado.");
        }

        await db.user.delete({
            where: { id }
        });

        revalidatePath('/team');
        return { success: true };
    } catch (error) {
        console.error("Error deleting manager:", error);
        return { error: error instanceof Error ? error.message : "Ocurrió un error al eliminar el encargado." };
    }
}
