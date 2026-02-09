'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';

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

export async function logout() {
    await signOut({ redirectTo: '/login' });
}
