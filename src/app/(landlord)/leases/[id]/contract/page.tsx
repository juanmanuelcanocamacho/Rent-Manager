import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { notFound } from 'next/navigation';
import { ContractPreview } from '@/components/leases/contract-preview';

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
    await requireManagementAccess();
    const landlordId = await getLandlordContext();
    const { id } = await params;

    const lease = await db.lease.findFirst({
        where: { id, landlordId },
        include: {
            tenant: {
                include: { user: true }
            },
            rooms: true,
        }
    });

    const landlord = await (db.user as any).findUnique({
        where: { id: landlordId },
    });

    if (!lease || !landlord) notFound();

    return (
        <ContractPreview lease={lease} landlord={landlord} />
    );
}
