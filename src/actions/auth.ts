'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function login(prevState: any, formData: FormData) {
    try {
        console.log('[Action] Login action started');
        const email = formData.get('email') as string;

        let redirectTo = '/dashboard'; // Default for Landlord

        // Check role to redirect correctly
        if (email) {
            const user = await db.user.findUnique({
                where: { email },
                select: { role: true }
            });

            if (user?.role === 'TENANT') {
                redirectTo = '/me';
            }
        }

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo,
        });
    } catch (error) {
        console.log('[Action] Login action caught error:', error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Credenciales incorrectas' };
                default:
                    return { error: 'Error desconocido' };
            }
        }
        throw error;
    }
}

export async function registerLandlord(prevState: any, formData: FormData) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const code = formData.get('code') as string;

        const registrationCode = process.env.LANDLORD_REGISTRATION_CODE || 'RENT_ADMIN_2025';

        if (code !== registrationCode) {
            return { error: 'Código de registro inválido' };
        }

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'El email ya está registrado' };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                email,
                passwordHash,
                role: Role.LANDLORD
            }
        });

        // After registration, log them in
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: 'Registro completado, pero error al iniciar sesión automáticamente. Por favor inicia sesión.' };
        }
        // Rethrow redirect errors or other non-auth errors
        throw error;
    }
}

export async function authAction(prevState: any, formData: FormData) {
    const mode = formData.get('mode') as string;
    if (mode === 'register') {
        return registerLandlord(prevState, formData);
    }
    return login(prevState, formData);
}

export async function logout() {
    await signOut({ redirectTo: '/login' });
}
