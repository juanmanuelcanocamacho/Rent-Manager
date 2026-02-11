import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { InvoiceStatus } from '@prisma/client';
import { getNowInMadrid } from '@/lib/dates';
import { Card } from '@/components/ui/shared';
import { FinancialHeader } from '@/components/invoices/financial-header';
import { InvoiceFilters } from '@/components/invoices/invoice-filters';
import { TenantBillingCard } from '@/components/invoices/tenant-billing-card';

export default async function InvoicesPage(props: { searchParams: Promise<{ status?: string; search?: string }> }) {
    await requireLandlord();
    const landlordId = await getLandlordContext();
    const searchParams = await props.searchParams;

    const statusFilter = searchParams.status || 'ALL';
    const searchTerm = searchParams.search?.toLowerCase() || '';

    // 1. Fetch ALL invoices for Global KPIs (Single Query for efficiency?)
    // Actually we need to calculate totals based on ALL data, but show Filtered data.
    // Optimization: separate count queries vs data queries if data is large.
    // For now, fetching all is okay for typical landlord size (< 1000 invoices).
    // Let's fetch all invoices for this landlord to compute Everything.

    const allInvoices = await db.invoice.findMany({
        where: {
            lease: {
                landlordId: landlordId
            }
        },
        include: {
            lease: {
                include: {
                    rooms: true,
                    tenant: true
                }
            },
            proof: true
        },
        orderBy: { dueDate: 'asc' }
    });

    // 2. Calculate Global KPIs
    const now = getNowInMadrid();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const totalDebtCents = allInvoices
        .filter(i => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + i.amountCents, 0);

    const overdueCount = allInvoices.filter(i => i.status === 'OVERDUE').length;

    const upcomingCents = allInvoices
        .filter(i => (i.status === 'PENDING' || i.status === 'PAYMENT_PROCESSING') && i.dueDate <= thirtyDaysFromNow && i.dueDate >= now)
        .reduce((sum, i) => sum + i.amountCents, 0);

    // Identify tenants up to date (Tenants with NO overdue invoices)
    // We need list of ALL active tenants first.
    // Or we can infer from invoices, but better to fetch tenants.
    // Let's fetch tenants to have a complete list (even those without invoices yet or paid ones).
    const allTenants = await db.tenantProfile.findMany({
        where: { landlordId: landlordId },
        select: { id: true, fullName: true },
        orderBy: { fullName: 'asc' }
    });

    const tenantsWithOverdue = new Set(
        allInvoices.filter(i => i.status === 'OVERDUE').map(i => i.lease.tenantId)
    );

    const upToDateCount = allTenants.length - tenantsWithOverdue.size;

    // 3. Filter Invoices for Display
    let filteredInvoices = allInvoices;

    // Filter by Status
    if (statusFilter === 'OVERDUE') {
        filteredInvoices = filteredInvoices.filter(i => i.status === 'OVERDUE');
    } else if (statusFilter === 'UP_TO_DATE' || statusFilter === 'PAID') { // "Al día" broadly means paid or pending but not overdue. UI says "Al día". But filter dropdown has Paid, Pending, Overdue in previous code. New plan says: Vencidas, Al día, Por vencer, Todas.
        // Logic for "Al día" filter in list: Show tenants who are up to date? Or show Paid invoices?
        // User request: "Estados del filtro: Vencidas, Al día, Por vencer, Todas"
        // Let's map these:
        // OVERDUE -> invoices.status == OVERDUE
        // UP_TO_DATE -> Invoices paid? Or active leases with no overdue?
        // Interpretation: Show invoices that represent "good standing" (Resolved/Paid) OR just filter tenants?
        // Actually, the view is "Tenant Cards". The filter applies to which *tenants* we see OR which *invoices* we see?
        // If I select "Vencidas", I expect to see Tenants who have overdue invoices.
        // If I select "Al día", I expect to see Tenants who are up to date.
        // If I select "Todas", I see every tenant.

        // Let's filter the TENANTS list based on the criteria, but pass their relevant invoices.
        // Actually, filtering logic is complex.
        // Let's keep logic simple:
        // We will filter the list of TENANTS to display.
    }

    // 4. Group Invoices by Tenant
    const invoicesByTenant: Record<string, typeof allInvoices> = {};
    allInvoices.forEach(inv => {
        const tid = inv.lease.tenantId;
        if (!invoicesByTenant[tid]) invoicesByTenant[tid] = [];
        invoicesByTenant[tid].push(inv);
    });

    // 5. Prepare Tenant List
    // We want to show cards for ALL tenants (that match search/filter).
    // If a tenant has no invoices, do we show them? Yes, with "Al día" status probably.

    let visibleTenants = allTenants.map(t => {
        const tenantInvoices = invoicesByTenant[t.id] || [];
        // Determine status for sorting/filtering
        const hasOverdue = tenantInvoices.some(i => i.status === 'OVERDUE');
        const nextPayment = tenantInvoices
            .filter(i => i.status === 'PENDING' || i.status === 'PAYMENT_PROCESSING')
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

        return {
            ...t,
            invoices: tenantInvoices,
            hasOverdue,
            nextDueDate: nextPayment?.dueDate
        };
    });

    // Apply Search Filter
    if (searchTerm) {
        visibleTenants = visibleTenants.filter(t => t.fullName.toLowerCase().includes(searchTerm));
    }

    // Apply Status Filter
    if (statusFilter === 'OVERDUE') {
        visibleTenants = visibleTenants.filter(t => t.hasOverdue);
    } else if (statusFilter === 'UP_TO_DATE') {
        visibleTenants = visibleTenants.filter(t => !t.hasOverdue);
    } else if (statusFilter === 'UPCOMING') {
        // Tenants with pending invoices due soon
        visibleTenants = visibleTenants.filter(t => {
            if (t.hasOverdue) return false; // Exclude overdue from "Upcoming" usually? Or include? "Por vencer" usually implies not yet overdue.
            return t.invoices.some(i => (i.status === 'PENDING' || i.status === 'PAYMENT_PROCESSING') && i.dueDate <= thirtyDaysFromNow && i.dueDate >= now);
        });
    }

    // Sort: Overdue first, then by next due date
    visibleTenants.sort((a, b) => {
        if (a.hasOverdue && !b.hasOverdue) return -1;
        if (!a.hasOverdue && b.hasOverdue) return 1;
        // Both overdue or both not
        if (a.hasOverdue) {
            // Sort by debt amount? Or alphabetical? Let's go alphabetical or by debt.
            // Simple: Alphabetical
            return a.fullName.localeCompare(b.fullName);
        }
        // Both up to date, sort by next payment date (earlier first)
        const dateA = a.nextDueDate?.getTime() || Number.MAX_VALUE;
        const dateB = b.nextDueDate?.getTime() || Number.MAX_VALUE;
        return dateA - dateB;
    });

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* 1. Header Global con KPIs */}
            <FinancialHeader
                totalDebtCents={totalDebtCents}
                overdueCount={overdueCount}
                upToDateCount={upToDateCount}
                upcomingCents={upcomingCents}
            />

            {/* 2. Filtros Sticky */}
            <InvoiceFilters
                tenants={allTenants}
            />

            {/* 3. Lista de Tarjetas de Inquilino */}
            <div className="grid grid-cols-1 gap-4">
                {visibleTenants.map(tenant => (
                    <TenantBillingCard
                        key={tenant.id}
                        tenantName={tenant.fullName}
                        invoices={tenant.invoices}
                    />
                ))}

                {visibleTenants.length === 0 && (
                    <Card className="p-12 text-center bg-muted/20 border-dashed">
                        <p className="text-muted-foreground italic text-lg">
                            {searchTerm
                                ? `No se encontraron resultados para "${searchTerm}"`
                                : "No hay inquilinos que coincidan con los filtros."}
                        </p>
                        {statusFilter !== 'ALL' && (
                            <p className="text-sm text-muted-foreground mt-2">Prueba cambiando el filtro de estado.</p>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
