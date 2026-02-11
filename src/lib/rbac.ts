import { auth } from './auth';
import { redirect } from 'next/navigation';
import { db } from './db';
import { Role } from '@prisma/client';

export async function getSessionUser() {
    const session = await auth();
    return session?.user;
}

export async function requireLandlord() {
    const user = await getSessionUser();
    console.log(`[RBAC] requireLandlord: User=${user?.email}, Role=${user?.role}`);

    if (!user || user.role !== Role.LANDLORD) {
        console.log('[RBAC] requireLandlord: Redirecting to /login');
        redirect('/login');
    }
    return user;
}

export async function requireManagementAccess() {
    const user = await getSessionUser();
    if (!user || (user.role !== Role.LANDLORD && user.role !== Role.MANAGER)) {
        redirect('/login');
    }
    return user;
}

/**
 * Returns the ID of the Landlord who "owns" the data.
 * If user is LANDLORD, returns their own ID.
 * If user is MANAGER, returns their landlordId.
 */
export async function getLandlordContext() {
    const user = await requireManagementAccess();
    if (user.role === Role.LANDLORD) {
        return user.id;
    }
    // If manager, we might need to fetch the user from DB to get landlordId 
    // because NextAuth session might not have it yet.
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.landlordId && user.role === Role.MANAGER) {
        throw new Error("Manager has no associated landlord");
    }
    return dbUser?.landlordId || user.id;
}

export async function requireTenant() {
    const user = await getSessionUser();
    if (!user || user.role !== Role.TENANT) {
        redirect('/login');
    }
    return user;
}

export async function getTenantProfileForSession() {
    const user = await requireTenant();
    const profile = await db.tenantProfile.findUnique({
        where: { userId: user.id },
    });

    if (!profile) {
        // Should not happen if data integrity is maintained
        throw new Error("Tenant profile not found");
    }

    return profile;
}
