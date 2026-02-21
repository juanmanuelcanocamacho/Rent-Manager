import { getTenantProfileForSession } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, Button, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { getNowInMadrid } from '@/lib/dates';
import {
    Wallet,
    Calendar,
    FileText,
    CreditCard,
    AlertCircle,
    ArrowRight,
    Home,
    Building2,
    MessageSquare,
} from 'lucide-react';
import { differenceInDays, addMonths } from 'date-fns';
import Link from 'next/link';

export default async function TenantDashboard() {
    const profile = await getTenantProfileForSession();

    // Get active lease
    const lease = await db.lease.findFirst({
        where: { tenantId: profile.id, status: 'ACTIVE' },
        include: { rooms: true }
    });

    if (!lease) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold">Bienvenido, {profile.fullName}</h1>
                <p className="text-muted-foreground mt-2">No tienes un contrato de alquiler activo actualmente.</p>
            </div>
        );
    }

    // Calculate Debt and Next Payment
    const invoices = await db.invoice.findMany({
        where: { leaseId: lease.id },
    });

    const overdue = invoices.filter(i => i.status === 'OVERDUE');
    const totalDebt = overdue.reduce((acc, curr) => acc + curr.amountCents, 0);

    const pending = invoices.filter(i => i.status === 'PENDING').sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nextInvoice = pending[0]; // First pending

    // Calculate Next Payment Logic
    const now = getNowInMadrid();
    let targetDate: Date;
    let paymentAmount = nextInvoice ? nextInvoice.amountCents : lease.rentAmountCents;
    let statusText = "";
    let dateLabel = "Vence el";
    let isUrgent = false;

    // 1. Check Overdue (Priority)
    if (overdue.length > 0) {
        const oldestOverdue = overdue.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
        targetDate = oldestOverdue.dueDate;
        paymentAmount = oldestOverdue.amountCents;
        const diff = differenceInDays(now, targetDate);
        statusText = `Vencida hace ${diff} días`;
        dateLabel = "Venció el";
        isUrgent = true;
    }
    // 2. Check Pending
    else if (nextInvoice) {
        targetDate = nextInvoice.dueDate;
        const diff = differenceInDays(targetDate, now);
        if (diff < 0) { // Should be covered by overdue, but just in case
            statusText = `Vencida hace ${Math.abs(diff)} días`;
            isUrgent = true;
        } else if (diff === 0) {
            statusText = "Vence hoy";
            isUrgent = true;
        } else if (diff === 1) {
            statusText = "Vence mañana";
        } else {
            statusText = `Faltan ${diff} días`;
        }
    }
    // 3. No invoice? Project next billing date
    else {
        const currentMonthAttempt = new Date(now.getFullYear(), now.getMonth(), lease.billingDay);
        if (currentMonthAttempt > now) {
            targetDate = currentMonthAttempt;
        } else {
            targetDate = addMonths(currentMonthAttempt, 1);
        }
        const diff = differenceInDays(targetDate, now);
        statusText = `Faltan ${diff} días`;
        dateLabel = "Próxima fecha";
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-indigo-600 to-purple-600 w-fit">
                    Hola, {profile.fullName.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Aquí tienes el resumen detallado de tu alquiler en <span className="font-semibold text-foreground decoration-primary/30 underline decoration-2 underline-offset-4">{lease.rooms.map(r => r.name).join(', ')}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Status Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Balance Card - Ultra Premium Style */}
                    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative group">
                        <div className="absolute top-0 right-0 p-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-white/15 transition-colors duration-700"></div>
                        <div className="absolute bottom-0 left-0 p-32 bg-indigo-400/10 rounded-full blur-[100px] -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="p-10 relative z-10 transition-transform duration-500 hover:scale-[1.01]">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-indigo-100 font-semibold flex items-center gap-2.5 tracking-wide uppercase text-xs">
                                    <div className="p-1.5 bg-white/10 rounded-md">
                                        <Wallet size={16} />
                                    </div>
                                    Estado de Cuenta
                                </h3>
                                <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                                    Bolivia (Bs)
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
                                <div className="space-y-2">
                                    <p className="text-indigo-200/80 text-sm font-medium">Deuda Pendiente</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-5xl font-black tracking-tighter">
                                            {formatMoney(totalDebt)}
                                        </p>
                                    </div>
                                    {totalDebt > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-200 text-[10px] font-bold uppercase tracking-wider mt-4 animate-pulse">
                                            <AlertCircle size={10} />
                                            Pago Requerido
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider mt-4">
                                            ✓ Al día
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 md:pt-0 md:pl-12 space-y-4">
                                    <p className="text-indigo-200/80 text-sm font-medium">Próxima Cuota</p>
                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-3xl font-bold tracking-tight">{formatMoney(paymentAmount)}</p>
                                            {isUrgent && (
                                                <Badge className="bg-rose-500 text-white border-0 animate-bounce h-5 px-1.5">
                                                    Urgente
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xl font-medium text-white/90">{statusText}</p>
                                            <p className="text-sm text-indigo-200 flex items-center gap-2 pt-1 font-light italic">
                                                <Calendar size={14} className="opacity-70" /> {dateLabel} <span className="font-semibold">{targetDate.toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Feature Grid - More Vibrant */}
                    <div>
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Acceso Rápido</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            <Link href="#" className="group bg-card hover:bg-primary/5 dark:hover:bg-primary/20 rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col items-center gap-3">
                                <div className="p-3.5 bg-primary/10 dark:bg-primary/30 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <span className="text-sm font-bold">Contrato</span>
                            </Link>
                            <Link href="/me/invoices" className="group bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col items-center gap-3">
                                <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                    <CreditCard size={24} />
                                </div>
                                <span className="text-sm font-bold">Recibos</span>
                            </Link>
                            <Link href="/me/messages" className="group bg-card hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col items-center gap-3">
                                <div className="p-3.5 bg-orange-500/10 dark:bg-orange-500/30 rounded-2xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={24} />
                                </div>
                                <span className="text-sm font-bold">Incidencias</span>
                            </Link>
                            <Link href="#" className="group bg-card hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col items-center gap-3">
                                <div className="p-3.5 bg-blue-500/10 dark:bg-blue-500/30 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <Building2 size={24} />
                                </div>
                                <span className="text-sm font-bold">Normas</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info - More Polished */}
                <div className="space-y-8">
                    <Card className="overflow-hidden border shadow-xl bg-card">
                        <div className="bg-muted/50 px-6 py-4 border-b">
                            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                                <Home size={16} /> Detalles del Alquiler
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-center group">
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Habitación</span>
                                <Badge variant="secondary" className="font-bold">{lease.rooms.map(r => r.name).join(', ')}</Badge>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Renta Base</span>
                                <span className="font-black text-primary text-base">{formatMoney(lease.rentAmountCents)}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Día de Pago</span>
                                <div className="text-right">
                                    <span className="font-bold text-sm block">Día {lease.billingDay}</span>
                                    <span className="text-[10px] text-muted-foreground italic leading-none">de cada mes</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-4">
                        <Button asChild size="lg" className="w-full shadow-lg shadow-primary/20 h-14 rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
                            <a href="/me/invoices" className="flex justify-between items-center group px-1 text-primary-foreground">
                                <span className="font-bold tracking-tight">Ver Historial de Pagos</span>
                                <div className="p-1 bg-white/20 dark:bg-black/20 rounded-full group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={18} />
                                </div>
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full h-14 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-[0.98]">
                            <a href="/me/messages" className="flex justify-between items-center group px-1 text-muted-foreground hover:text-primary">
                                <span className="font-bold tracking-tight">Reportar Incidencia</span>
                                <div className="p-1 bg-muted group-hover:bg-primary/20 rounded-full transition-colors">
                                    <MessageSquare size={18} />
                                </div>
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
