import { getTenantProfileForSession } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';

export default async function TenantInvoicesPage() {
    const profile = await getTenantProfileForSession();

    // Get all invoices for this tenant's leases
    const invoices = await db.invoice.findMany({
        where: {
            lease: { tenantId: profile.id }
        },
        include: { lease: { include: { rooms: true } } },
        orderBy: { dueDate: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mis Facturas</h1>
                <p className="text-muted-foreground">Historial de pagos y cuotas pendientes.</p>
            </div>

            <div className="space-y-4">
                {invoices.map((inv) => (
                    <Card key={inv.id} className="p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">{formatMoney(inv.amountCents)}</span>
                                <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                                    {inv.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Vence: {inv.dueDate.toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right text-xs">
                            {inv.paidAt ? (
                                <span className="text-green-600">Pagado el {inv.paidAt.toLocaleDateString()}</span>
                            ) : (
                                <span className="text-muted-foreground">Pendiente</span>
                            )}
                        </div>
                    </Card>
                ))}
                {invoices.length === 0 && <p className="text-muted-foreground">No tienes facturas.</p>}
            </div>
        </div>
    );
}
