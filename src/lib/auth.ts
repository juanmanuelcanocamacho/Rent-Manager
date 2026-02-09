import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from './db';

// Define schema for login validation
const loginSchema = z.object({
    email: z.string().min(1),
    password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    useSecureCookies: process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https://'),
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
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const { email, password } = await loginSchema.parseAsync(credentials);

                console.log(`[Auth] Attempting login for email: ${email}`);

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    console.log(`[Auth] User not found for email: ${email}`);
                    throw new Error("Invalid credentials");
                }

                console.log(`[Auth] User found for email: ${email}, Role: ${user.role}, HashPrefix: ${user.passwordHash.substring(0, 10)}...`);

                const isValid = await bcrypt.compare(password, user.passwordHash);

                console.log(`[Auth] Password validation result for ${email}: ${isValid}`);

                if (!isValid) {
                    console.log(`[Auth] Invalid password for email: ${email}`);
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as "LANDLORD" | "TENANT";
                session.user.id = token.id as string;
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
