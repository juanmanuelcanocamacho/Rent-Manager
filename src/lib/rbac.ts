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
