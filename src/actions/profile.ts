'use server';

import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(prevState: any, formData: FormData) {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.id) return { error: 'No autorizado' };

    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const phone = formData.get('phone') as string;
    const country = formData.get('country') as string;

    // Legal fields
    const documentNumber = formData.get('documentNumber') as string;
    const documentIssuedIn = formData.get('documentIssuedIn') as string;
    const maritalStatus = formData.get('maritalStatus') as string;
    const legalAddress = formData.get('legalAddress') as string;

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const wantsToChangePassword = newPassword && newPassword.length > 0;

    try {
        const currentUser = await db.user.findUnique({ where: { id: sessionUser.id } });
        if (!currentUser) return { error: 'Usuario no encontrado' };

        // --- Password Change Validation ---
        if (wantsToChangePassword) {
            if (!currentPassword) {
                return { error: 'Debes introducir tu contraseña actual para poder cambiarla.' };
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
            if (!isCurrentPasswordValid) {
                return { error: 'La contraseña actual introducida no es correcta.' };
            }

            if (newPassword.length < 8) {
                return { error: 'La nueva contraseña debe tener al menos 8 caracteres.' };
            }

            if (newPassword !== confirmPassword) {
                return { error: 'La nueva contraseña y la confirmación no coinciden.' };
            }
        }

        // --- Username Uniqueness Validation ---
        if (username && username !== currentUser.username) {
            const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
            const existing = await db.user.findUnique({ where: { username: cleanUsername } });
            if (existing) return { error: 'El nombre de usuario ya está en uso.' };
        }

        // --- Build update data ---
        const updateData: any = {
            name,
            username: username ? username.toLowerCase().replace(/\s+/g, '') : currentUser.username,
            phone,
            country: country as any,
            documentNumber,
            documentIssuedIn,
            maritalStatus,
            legalAddress,
        };

        if (wantsToChangePassword) {
            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        await db.user.update({
            where: { id: sessionUser.id },
            data: updateData,
        });

        revalidatePath('/profile');
        revalidatePath('/', 'layout');

        return {
            success: wantsToChangePassword
                ? 'Perfil y contraseña actualizados correctamente.'
                : 'Perfil actualizado correctamente.',
        };
    } catch (error) {
        console.error('[Action] updateProfile error:', error);
        return { error: 'Error al actualizar el perfil' };
    }
}

