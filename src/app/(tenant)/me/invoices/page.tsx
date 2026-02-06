import { getTenantProfileForSession } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { TenantInvoiceCard } from '@/components/invoices/tenant-invoice-card';

export default async function TenantInvoicesPage() {
    const profile = await getTenantProfileForSession();

    // Get all invoices for this tenant's leases
    const invoices = await db.invoice.findMany({
        where: {
            lease: { tenantId: profile.id }
        },
        include: { lease: { include: { rooms: true } } },
        orderBy: { dueDate: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mis Facturas</h1>
                <p className="text-muted-foreground">Historial de pagos y cuotas pendientes.</p>
            </div>

            <div className="space-y-4">
                {invoices.map((inv) => (
                    <TenantInvoiceCard key={inv.id} invoice={inv as any} />
                ))}
                {invoices.length === 0 && <p className="text-muted-foreground">No tienes facturas.</p>}
            </div>
        </div>
    );
}
