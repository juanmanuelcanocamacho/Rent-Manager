import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { Card, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { FileText, Home, Calendar } from 'lucide-react';

export default async function ManagerLeasesPage() {
    await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const leases = await db.lease.findMany({
        where: { landlordId },
        include: {
            rooms: true,
            tenant: true,
            invoices: {
                where: { status: { in: ['OVERDUE', 'PAYMENT_PROCESSING', 'PENDING'] } }
            }
        },
        orderBy: [{ status: 'asc' }, { startDate: 'desc' }]
    });

    const active = leases.filter(l => l.status === 'ACTIVE');
    const ended = leases.filter(l => l.status !== 'ACTIVE');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-1">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Contratos</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Vista de todos los contratos de alquiler.
                </p>
            </div>

            {/* Active leases */}
            <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">
                    Activos ({active.length})
                </h2>
                {active.map(lease => {
                    const overdueCount = lease.invoices.filter(i => i.status === 'OVERDUE').length;
                    const processingCount = lease.invoices.filter(i => i.status === 'PAYMENT_PROCESSING').length;

                    return (
                        <Card key={lease.id} className={`p-4 hover:shadow-md transition-all ${overdueCount > 0 ? 'border-rose-200 bg-rose-50/30' : ''}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-xl shrink-0 ${overdueCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        <Home size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <p className="font-bold text-base truncate">{lease.rooms.map(r => r.name).join(', ')}</p>
                                            <Badge variant="success" className="text-[10px] shrink-0">ACTIVO</Badge>
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
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{lease.tenant.fullName}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Calendar size={11} />
                                            Desde {lease.startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-lg text-primary">{formatMoney(lease.rentAmountCents)}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">/mes</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {active.length === 0 && (
                    <p className="text-muted-foreground italic text-sm px-1">No hay contratos activos.</p>
                )}
            </div>

            {/* Ended leases */}
            {ended.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-1">
                        Finalizados ({ended.length})
                    </h2>
                    {ended.map(lease => (
                        <Card key={lease.id} className="p-4 opacity-60">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{lease.rooms.map(r => r.name).join(', ')}</p>
                                        <p className="text-xs text-muted-foreground">{lease.tenant.fullName}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-[10px] shrink-0">FINALIZADO</Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
