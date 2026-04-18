'use server';

import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { getNowInMadrid } from '@/lib/dates';
import { Role } from '@prisma/client';

export async function getManagerDashboardData() {
    const user = await requireManagementAccess();
    if (user.role !== Role.MANAGER && user.role !== Role.LANDLORD) {
        throw new Error('Anuthorized access to manager dashboard.');
    }

    const landlordId = await getLandlordContext();
    const country = ((user as any).country as 'SPAIN' | 'BOLIVIA') || 'BOLIVIA';

    const now = getNowInMadrid();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Overdue Invoices (Priority HIGH - Red)
    const overdueInvoicesRaw = await db.invoice.findMany({
        where: {
            lease: { landlordId },
            status: 'OVERDUE'
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                    rooms: true
                }
            }
        },
        orderBy: { amountCents: 'desc' }
    });

    // Aggregate by tenant to show one card per tenant instead of per invoice
    const overdueByTenant = new Map<string, any>();
    for (const inv of overdueInvoicesRaw) {
        const tenantId = inv.lease.tenantId;
        if (!overdueByTenant.has(tenantId)) {
            overdueByTenant.set(tenantId, {
                tenantId: tenantId,
                tenantName: inv.lease.tenant.fullName,
                tenantPhone: inv.lease.tenant.phoneE164,
                totalAmountCents: 0,
                invoicesCount: 0,
                roomName: inv.lease.rooms.length > 0 ? inv.lease.rooms.map(r => r.name).join(', ') : 'Varios'
            });
        }
        const data = overdueByTenant.get(tenantId);
        data.totalAmountCents += inv.amountCents;
        data.invoicesCount += 1;
    }
    
    const aggregatedOverdue = Array.from(overdueByTenant.values());

    // 2. Expiring Leases (Priority MED - Yellow)
    const expiringLeases = await db.lease.findMany({
        where: {
            landlordId,
            status: 'ACTIVE',
            endDate: { lte: thirtyDaysFromNow, gte: now }
        },
        include: { tenant: true, rooms: true },
        orderBy: { endDate: 'asc' }
    });

    // 3. Available Rooms (Priority LOW - Blue)
    const availableRooms = (await db.room.findMany({
        where: {
            landlordId,
            status: 'AVAILABLE'
        },
    })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // Fetch full user profile to get name and username
    const managerProfile = await db.user.findUnique({
        where: { id: user.id },
        select: { name: true, username: true, email: true }
    });

    return {
        country,
        profileName: managerProfile?.name || managerProfile?.username || managerProfile?.email?.split('@')[0] || 'Encargado',
        profileEmail: managerProfile?.email || 'Encargado',
        aggregatedOverdue,
        expiringLeases,
        availableRooms
    };
}
