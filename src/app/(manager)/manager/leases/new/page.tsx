import { createLease } from '@/actions/leases';
import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { Button, Card, Input } from '@/components/ui/shared';
import { FilePlus, Home, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { NewLeaseForm } from '@/components/manager/new-lease-form';

export default async function ManagerNewLeasePage() {
    await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const rooms = (await db.room.findMany({
        where: { status: 'AVAILABLE', landlordId: landlordId },
    })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    
    const tenants = await db.tenantProfile.findMany({
        where: { landlordId: landlordId },
        orderBy: { fullName: 'asc' }
    });

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Nuevo Contrato</h1>
                <p className="text-muted-foreground mt-1">Vincula un inquilino a una propiedad.</p>
            </div>

            <NewLeaseForm rooms={rooms} tenants={tenants} />
        </div>
    );
}
