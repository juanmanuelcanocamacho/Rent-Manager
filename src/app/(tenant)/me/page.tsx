import { getTenantProfileForSession } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, Button, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { getNowInMadrid } from '@/lib/dates';
import {
    Wallet,
    Calendar,
    FileText,
    AlertCircle,
    ArrowRight,
    Building2,
    MessageSquare,
    PhoneCall,
    Info
} from 'lucide-react';
import { differenceInDays, addMonths } from 'date-fns';
import Link from 'next/link';

export default async function TenantDashboard() {
    const profile = await getTenantProfileForSession();

    // Get active lease
    const lease = await db.lease.findFirst({
        where: { tenantId: profile.id, status: 'ACTIVE' },
        include: { rooms: true, landlord: true }
    });

    if (!lease) {
        return (
            <div className="text-center py-20 px-6">
                <h1 className="text-2xl font-bold mb-4">Bienvenido, {profile.fullName}</h1>
                <p className="text-muted-foreground bg-muted p-4 rounded-xl inline-block">No tienes un contrato de alquiler activo actualmente.</p>
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
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-12 w-full max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2 flex-wrap">
                    <span className="bg-clip-text text-transparent bg-gradient-to-br from-primary via-indigo-600 to-purple-600">
                        Hola, {profile.fullName.split(' ')[0]}
                    </span>
                    <span>👋</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Resumen de tu alquiler en <span className="font-semibold text-foreground">{lease.rooms.map(r => r.name).join(', ')}</span>.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Status Column */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Compact Digital Wallet Card (Mobile Optimized) */}
                    <Card className="overflow-hidden border-0 shadow-[0_12px_40px_-10px_rgba(79,70,229,0.3)] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative group rounded-[28px] md:rounded-3xl">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none transition-colors duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="p-6 md:p-8 relative z-10 flex flex-col gap-6 md:gap-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1 w-full">
                                    <div className="flex items-center justify-between w-full mb-3">
                                        <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white font-medium px-2.5 py-1 text-xs">
                                            Estado de Cuenta
                                        </Badge>
                                    </div>
                                    <p className="text-indigo-200/90 text-xs md:text-sm font-medium">Deuda Pendiente</p>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                                            {formatMoney(totalDebt)}
                                        </h2>
                                        {totalDebt > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 animate-pulse whitespace-nowrap">
                                                <AlertCircle size={10} /> Urgente
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                                ✓ Al día
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 flex items-center justify-between border border-white/10 shadow-inner">
                                <div>
                                    <p className="text-indigo-200/90 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Próxima Cuota</p>
                                    <p className="text-lg md:text-xl font-bold tracking-tight">{formatMoney(paymentAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-medium text-sm md:text-base">{statusText}</p>
                                    <p className="text-indigo-200 text-[10px] md:text-xs mt-0.5 flex items-center justify-end gap-1.5 font-medium">
                                        <Calendar size={12} className="opacity-70" /> {dateLabel} <span className="font-semibold text-white">{targetDate.toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                            
                            {/* Primary Action Button placed INSIDE the card for mobile intuition */}
                            <Button asChild size="lg" className="w-full bg-white text-indigo-700 hover:bg-slate-50 hover:text-indigo-800 rounded-xl font-bold h-12 shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] transition-transform active:scale-95 border-0">
                                <Link href="/me/invoices" className="flex items-center justify-center w-full">
                                    {totalDebt > 0 ? 'Pagar Facturas Ahora' : 'Ver Mis Recibos'} 
                                    <ArrowRight size={18} className="ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Access Mobile Grid (Tighter spacing, horizontal layout on mobile) */}
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            Accesos Rápidos
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Link href="#" className="bg-card hover:bg-accent/50 rounded-[20px] p-4 border shadow-sm transition-all active:scale-95 flex items-center gap-3 md:flex-col md:text-center md:gap-2.5">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                                    <FileText size={18} />
                                </div>
                                <span className="text-[13px] font-bold text-foreground/90">Mi Contrato</span>
                            </Link>
                            <Link href="/me/messages" className="bg-card hover:bg-accent/50 rounded-[20px] p-4 border shadow-sm transition-all active:scale-95 flex items-center gap-3 md:flex-col md:text-center md:gap-2.5">
                                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-600 shrink-0">
                                    <MessageSquare size={18} />
                                </div>
                                <span className="text-[13px] font-bold text-foreground/90">Incidencias</span>
                            </Link>
                            <Link href="#" className="bg-card hover:bg-accent/50 rounded-[20px] p-4 border shadow-sm transition-all active:scale-95 flex items-center gap-3 md:flex-col md:text-center md:gap-2.5">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 shrink-0">
                                    <Building2 size={18} />
                                </div>
                                <span className="text-[13px] font-bold text-foreground/90">Normas</span>
                            </Link>
                            <Link href="#" className="bg-card hover:bg-accent/50 rounded-[20px] p-4 border shadow-sm transition-all active:scale-95 flex items-center gap-3 md:flex-col md:text-center md:gap-2.5">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 shrink-0">
                                    <PhoneCall size={18} />
                                </div>
                                <span className="text-[13px] font-bold text-foreground/90">Contacto</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info & Details Sidebar - Less intrusive, sleek list */}
                <div className="space-y-6">
                    <Card className="rounded-[24px] border shadow-sm bg-card overflow-hidden">
                        <div className="px-5 py-3.5 border-b bg-muted/40 backdrop-blur-xl">
                            <h3 className="font-bold flex items-center gap-2 text-[13px] text-foreground">
                                <Info size={16} className="text-primary"/> Mi Alquiler
                            </h3>
                        </div>
                        <div className="p-5 space-y-4 text-[13px]">
                            <div className="flex justify-between items-center group">
                                <span className="text-muted-foreground">Propiedad</span>
                                <span className="font-semibold text-right text-foreground">{lease.rooms.map(r => r.name).join(', ')}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-muted-foreground">Renta Base</span>
                                <span className="font-bold text-foreground">{formatMoney(lease.rentAmountCents)}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-muted-foreground">Día de Pago</span>
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold text-xs">Día {lease.billingDay}</span>
                            </div>
                            <div className="flex justify-between items-center group pt-2 border-t border-dashed">
                                <span className="text-muted-foreground">Propietario</span>
                                <span className="font-medium text-right text-[12px] truncate max-w-[140px] opacity-80">{lease.landlord.email}</span>
                            </div>
                        </div>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground font-medium">Plataforma gestionada por Llavia</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
