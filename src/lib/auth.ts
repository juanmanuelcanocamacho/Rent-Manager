import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from './db';

// Define schema for login validation
const loginSchema = z.object({
    identifier: z.string().min(1),
    password: z.string().min(1),
});

const useSecureCookies = process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https://');

export const { handlers, signIn, signOut, auth } = NextAuth({
    useSecureCookies,
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https://') ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https://'),
            },
        },
    },
    providers: [
        Credentials({
            credentials: {
                identifier: { label: "Email o Usuario", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { identifier, password } = await loginSchema.parseAsync(credentials);

                const user = await db.user.findFirst({
                    where: {
                        OR: [
                            { email: identifier },
                            { username: identifier }
                        ]
                    },
                });

                if (!user) {
                    throw new Error("Credenciales inválidas");
                }

                const isValid = await bcrypt.compare(password, user.passwordHash);

                if (!isValid) {
                    throw new Error("Credenciales inválidas");
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    country: user.country,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                (token as any).country = (user as any).country;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as "LANDLORD" | "TENANT";
                session.user.id = token.id as string;
                (session.user as any).country = (token as any).country;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
});
