'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function login(prevState: any, formData: FormData) {
    try {
        console.log('[Action] Login action started');
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirectTo: '/me',
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
