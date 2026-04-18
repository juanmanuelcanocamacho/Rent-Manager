'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function login(prevState: any, formData: FormData) {
    try {
        console.log('[Action] Login action started');
        const identifier = formData.get('email') as string; // We keep name="email" in form for autofill but it works as identifier

        let redirectTo = '/dashboard'; // Default for Landlord

        // Check role to redirect correctly
        if (identifier) {
            const user = await db.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier }
                    ]
                },
                select: { role: true }
            });

            if (user?.role === 'TENANT') {
                redirectTo = '/me';
            } else if (user?.role === 'MANAGER') {
                redirectTo = '/manager/dashboard';
            }
        }

        await signIn('credentials', {
            identifier,
            password: formData.get('password') as string,
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
        const country = formData.get('country') as string;

        const registrationCode = process.env.LANDLORD_REGISTRATION_CODE || 'RENT_ADMIN_2025';

        if (code !== registrationCode) {
            return { error: 'Código de registro inválido' };
        }

        if (!country || !['SPAIN', 'BOLIVIA'].includes(country)) {
            return { error: 'Selecciona un país válido' };
        }

        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'El email ya está registrado' };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        await db.user.create({
            data: {
                email,
                username,
                passwordHash,
                role: Role.LANDLORD,
                country: country as any,
            }
        });

        // After registration, log them in
        await signIn('credentials', {
            identifier: email,
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
