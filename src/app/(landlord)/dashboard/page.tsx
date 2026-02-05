import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { formatMoney } from '@/lib/money';
import { Card, Button, Badge } from '@/components/ui/shared';
import { getNowInMadrid } from '@/lib/dates';
import { AlertCircle, CheckCircle, Clock, Home, UserPlus, FileText, CreditCard, ChevronRight, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default async function LandlordDashboard() {
    await requireLandlord();

    const today = getNowInMadrid();

    // Fetch statistics
    const overdueInvoices = await db.invoice.findMany({
        where: { status: 'OVERDUE' },
        include: { lease: { include: { tenant: true } } }
    });

    const overdueSum = overdueInvoices.reduce((acc, curr) => acc + curr.amountCents, 0);

    // Due coming 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const pendingInvoices = await db.invoice.findMany({
        where: {
            status: 'PENDING',
            dueDate: { lte: nextWeek, gte: today }
        }
    });

    const roomsOccupied = await db.room.count({ where: { status: 'OCCUPIED' } });
    const roomsTotal = await db.room.count();
    const occupancyRate = roomsTotal > 0 ? Math.round((roomsOccupied / roomsTotal) * 100) : 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Resumen general de tus propiedades y finanzas.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded-lg backdrop-blur-sm border">
                    <Clock size={16} />
                    <span>{today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Deuda Vencida */}
                <Card className={`p-6 relative overflow-hidden group border-destructive/20 ${overdueInvoices.length > 0 ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={80} className="text-destructive" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                                <AlertCircle size={20} />
                            </div>
                            <span className="font-semibold text-destructive">Deuda Vencida</span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                            {formatMoney(overdueSum)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {overdueInvoices.length} facturas requieren atención
                        </p>
                    </div>
                </Card>

                {/* Cobros Semana */}
                <Link href="/invoices?status=PENDING&due=week">
                    <Card className="p-6 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={80} className="text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <span className="font-semibold text-blue-600">Cobros esta semana</span>
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                {pendingInvoices.length}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Facturas pendientes (7 días)
                            </p>
                        </div>
                    </Card>
                </Link>

                {/* Ocupación */}
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                <CheckCircle size={20} />
                            </div>
                            <span className="font-semibold text-emerald-600">Ocupación</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                {occupancyRate}%
                            </h3>
                            <span className="text-sm text-muted-foreground mb-1">
                                ({roomsOccupied}/{roomsTotal})
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${occupancyRate}%` }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Alerts & Activity (2 cols wide) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertCircle className="text-slate-400" size={20} />
                        Atención Requerida
                    </h2>

                    {overdueInvoices.length > 0 ? (
                        <div className="space-y-3">
                            {overdueInvoices.slice(0, 5).map(inv => (
                                <Card key={inv.id} className="p-4 flex items-center justify-between border-l-4 border-l-destructive hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                                            !
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.lease.tenant.fullName}</p>
                                            <p className="text-xs text-red-500 font-medium">
                                                Venció el {inv.dueDate.toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">
                                            {formatMoney(inv.amountCents)}
                                        </span>
                                        <Button size="sm" variant="ghost" className="text-primary" asChild>
                                            <Link href={`/invoices?tenantId=${inv.lease.tenantId}&status=OVERDUE`}>
                                                Revisar <ChevronRight size={16} />
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {overdueInvoices.length > 5 && (
                                <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                                    <Link href="/invoices?status=OVERDUE">
                                        Ver {overdueInvoices.length - 5} facturas vencidas más...
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed">
                            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">¡Todo al día!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                No hay pagos pendientes de atención en este momento.
                            </p>
                        </Card>
                    )}
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CreditCard className="text-slate-400" size={20} />
                        Acciones
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <QuickActionCard
                            href="/tenants"
                            icon={<UserPlus size={24} />}
                            title="Nuevo Inquilino"
                            description="Registrar entrada"
                            color="bg-violet-500"
                        />
                        <QuickActionCard
                            href="/leases"
                            icon={<FileText size={24} />}
                            title="Nuevo Contrato"
                            description="Crear arrendamiento"
                            color="bg-blue-500"
                        />
                        <QuickActionCard
                            href="/rooms"
                            icon={<Home size={24} />}
                            title="Gestionar Pisos"
                            description="Ver habitaciones"
                            color="bg-emerald-500"
                        />
                        <QuickActionCard
                            href="/invoices"
                            icon={<CreditCard size={24} />}
                            title="Facturación"
                            description="Ver cobros"
                            color="bg-amber-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ href, icon, title, description, color }: { href: string, icon: React.ReactNode, title: string, description: string, color: string }) {
    return (
        <Link href={href}>
            <Card className="p-4 flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group border-transparent hover:border-border/50 bg-white dark:bg-slate-900">
                <div className={`${color} text-white p-3 rounded-xl shadow-lg shadow-${color.replace('bg-', '')}/20 group-hover:shadow-${color.replace('bg-', '')}/40 transition-shadow`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <ChevronRight className="ml-auto text-slate-300 group-hover:text-primary transition-colors" size={18} />
            </Card>
        </Link>
    );
}
