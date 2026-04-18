import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { Card, Badge } from '@/components/ui/shared';
import { User, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function ManagerTenantsPage() {
    await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const tenants = await db.tenantProfile.findMany({
        where: { landlordId },
        include: {
            leases: {
                where: { status: 'ACTIVE' },
                include: { rooms: true, invoices: { where: { status: { in: ['OVERDUE', 'PAYMENT_PROCESSING'] } } } }
            }
        },
        orderBy: { fullName: 'asc' }
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-1">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Inquilinos</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Directorio de residentes activos.
                </p>
            </div>

            <div className="space-y-3">
                {tenants.map(tenant => {
                    const activeLease = tenant.leases[0];
                    const rooms = activeLease?.rooms.map(r => r.name).join(', ') ?? null;
                    const overdueCount = activeLease?.invoices.filter(i => i.status === 'OVERDUE').length ?? 0;
                    const processingCount = activeLease?.invoices.filter(i => i.status === 'PAYMENT_PROCESSING').length ?? 0;

                    return (
                        <Card key={tenant.id} className="p-4 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                                <div className={`h-12 w-12 min-w-[48px] rounded-full flex items-center justify-center font-bold text-lg
                                    ${overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-primary/10 text-primary'}`}>
                                    {tenant.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-base truncate">{tenant.fullName}</h3>
                                        {overdueCount > 0 && (
                                            <Badge variant="destructive" className="text-[10px] shrink-0">
                                                {overdueCount} vencida{overdueCount > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                        {processingCount > 0 && (
                                            <Badge variant="warning" className="text-[10px] shrink-0">
                                                {processingCount} en revisión
                                            </Badge>
                                        )}
                                        {!activeLease && (
                                            <Badge variant="secondary" className="text-[10px] shrink-0">Sin contrato</Badge>
                                        )}
                                    </div>
                                    {rooms && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                            <FileText size={12} className="shrink-0" /> {rooms}
                                        </p>
                                    )}
                                    {tenant.phoneE164 && (
                                        <a
                                            href={`tel:${tenant.phoneE164}`}
                                            className="text-sm text-blue-600 flex items-center gap-1.5 mt-1 hover:underline"
                                        >
                                            <Phone size={12} /> {tenant.phoneE164}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {tenants.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground">
                        <User size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No hay inquilinos registrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
