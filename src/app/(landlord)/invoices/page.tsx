import { markInvoicePaid } from '@/actions/invoices';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { formatMoney } from '@/lib/money';
import { Badge, Button, Card } from '@/components/ui/shared';
import { CheckCircle } from 'lucide-react';
import { InvoiceStatus } from '@prisma/client';

import { getNowInMadrid } from '@/lib/dates';
import { TenantSelector } from '@/components/invoices/tenant-selector';
import { TenantInvoiceAccordion } from '@/components/invoices/tenant-invoice-accordion';

export default async function InvoicesPage(props: { searchParams: Promise<{ status?: InvoiceStatus; due?: string; tenantId?: string }> }) {
    await requireLandlord();
    const searchParams = await props.searchParams;

    const statusFilter = searchParams.status;
    const dueFilter = searchParams.due; // 'week', 'month', etc.
    const tenantIdFilter = searchParams.tenantId;

    let dateWhere = {};
    const now = getNowInMadrid();

    if (dueFilter === 'week') {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        dateWhere = {
            dueDate: {
                gte: now,
                lte: nextWeek
            }
        };
    }

    const where: any = {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...dateWhere
    };

    if (tenantIdFilter) {
        where.lease = {
            tenantId: tenantIdFilter
        };
    }

    const invoices = await db.invoice.findMany({
        where,
        include: {
            lease: {
                include: {
                    rooms: true,
                    tenant: true
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    });

    // Fetch tenants for the selector (could be optimized to only show tenants with invoices, but all is fine for now)
    const tenants = await db.tenantProfile.findMany({
        select: { id: true, fullName: true },
        orderBy: { fullName: 'asc' }
    });

    // Group by Tenant
    const groupedInvoices: Record<string, { tenantName: string; invoices: any[] }> = {};

    invoices.forEach((inv) => {
        const tId = inv.lease.tenant.id;
        if (!groupedInvoices[tId]) {
            groupedInvoices[tId] = {
                tenantName: inv.lease.tenant.fullName,
                invoices: []
            };
        }
        groupedInvoices[tId].invoices.push(inv);
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facturas</h1>
                    <p className="text-muted-foreground">Control de cobros por inquilino.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
                    <TenantSelector tenants={tenants} />
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <Button variant="outline" asChild><a href="/invoices">Todas</a></Button>
                        <Button variant="outline" asChild><a href="/invoices?status=PENDING">Pendientes</a></Button>
                        <Button variant="outline" asChild><a href="/invoices?status=OVERDUE">Vencidas</a></Button>
                        <Button variant="outline" asChild><a href="/invoices?status=PAID">Pagadas</a></Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {Object.values(groupedInvoices).map((group) => (
                    <TenantInvoiceAccordion
                        key={group.tenantName}
                        tenantName={group.tenantName}
                        invoices={group.invoices}
                    />
                ))}

                {invoices.length === 0 && (
                    <Card className="p-8 text-center bg-muted/20 border-dashed">
                        <p className="text-muted-foreground italic">No se encontraron facturas para los filtros aplicados.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
