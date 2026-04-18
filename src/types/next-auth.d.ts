import { Role } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            role: Role
            username?: string | null
            name?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: Role
        username?: string | null
        name?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: Role
        username?: string | null
        name?: string | null
    }
}
