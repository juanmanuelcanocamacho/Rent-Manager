import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { getNowInMadrid } from '@/lib/dates';
import { Card, Badge } from '@/components/ui/shared';
import { InvoiceFilters } from '@/components/invoices/invoice-filters';
import { TenantBillingCard } from '@/components/invoices/tenant-billing-card';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function ManagerInvoicesPage(props: { searchParams: Promise<{ status?: string; search?: string }> }) {
    const user = await requireManagementAccess();
    if (user.role !== Role.MANAGER) {
        redirect('/invoices');
    }

    const landlordId = await getLandlordContext();
    const searchParams = await props.searchParams;

    const searchTerm = searchParams.search?.toLowerCase() || '';

    // Fetch only active leases data for managers
    const allTenants = await db.tenantProfile.findMany({
        where: { landlordId: landlordId },
        include: {
            leases: {
                where: { status: 'ACTIVE' },
                include: {
                    invoices: {
                        orderBy: { dueDate: 'asc' },
                        include: {
                            lease: {
                                include: { rooms: true, tenant: true }
                            }
                        }
                    },
                    rooms: true
                }
            }
        },
        orderBy: { fullName: 'asc' }
    });

    const now = getNowInMadrid();

    // Prepare data for display
    let visibleTenants = allTenants.map(t => {
        const tenantInvoices = t.leases.flatMap(l => l.invoices);
        const hasOverdue = tenantInvoices.some(i => i.status === 'OVERDUE');
        const processingCount = tenantInvoices.filter(i => i.status === 'PAYMENT_PROCESSING').length;

        return {
            ...t,
            invoices: tenantInvoices,
            hasOverdue,
            processingCount
        };
    });

    if (searchTerm) {
        visibleTenants = visibleTenants.filter(t => t.fullName.toLowerCase().includes(searchTerm));
    }

    // Sort: Overdue first
    visibleTenants.sort((a, b) => {
        if (a.hasOverdue && !b.hasOverdue) return -1;
        if (!a.hasOverdue && b.hasOverdue) return 1;
        return a.fullName.localeCompare(b.fullName);
    });

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 px-1">
            {/* Simple Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Gestión de Cobros</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Registra los cobros recibidos para que el dueño los verifique.
                </p>
            </div>

            {/* Quick Stats for Manager */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-rose-50 dark:bg-rose-900/10 border-rose-100 flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-rose-500">Vencidos</p>
                        <p className="text-lg font-black text-rose-700">{visibleTenants.filter(t => t.hasOverdue).length}</p>
                    </div>
                </Card>
                <Card className="p-4 bg-amber-50 dark:bg-amber-900/10 border-amber-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-amber-500">En Revisión</p>
                        <p className="text-lg font-black text-amber-700">{visibleTenants.reduce((acc, t) => acc + t.processingCount, 0)}</p>
                    </div>
                </Card>
            </div>

            <InvoiceFilters tenants={allTenants.map(t => ({ id: t.id, fullName: t.fullName }))} />

            <div className="grid grid-cols-1 gap-4">
                {visibleTenants.map(tenant => (
                    <TenantBillingCard
                        key={tenant.id}
                        tenantName={tenant.fullName}
                        invoices={tenant.invoices}
                    />
                ))}
            </div>
        </div>
    );
}
