import { getDashboardData } from '@/actions/dashboard';
import { Card, Button } from '@/components/ui/shared';
import Link from 'next/link';
import { formatMoney } from '@/lib/money';
import { getNowInMadrid } from '@/lib/dates';
import {
    Clock, TrendingUp, AlertCircle, Users, CheckCircle, CreditCard,
    UserPlus, FileText, Home, TrendingDown, ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';

export default async function LandlordDashboard() {
    // A single standardized call to our backend action
    const data = await getDashboardData();
    const today = getNowInMadrid();

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-3 md:gap-4 mb-2">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base lg:text-lg">
                        {data.isLandlord ? "Resumen integral de finanzas y propiedades." : "Panel de Gestión Operativa."}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground bg-accent/30 dark:bg-accent/10 p-2.5 px-4 rounded-xl backdrop-blur-sm border w-fit shadow-sm">
                        <Clock size={16} className="text-primary hidden md:block" />
                        <span className="font-medium">{today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    {/* Quick Access Ribbon for top actions, replacing the old sidebar block */}
                    {data.isLandlord && (
                        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                            <QuickRibbonButton href="/tenants/new" icon={<UserPlus size={16} />} text="Inquilino" />
                            <QuickRibbonButton href="/leases/new" icon={<FileText size={16} />} text="Contrato" />
                            <QuickRibbonButton href="/invoices" icon={<CreditCard size={16} />} text="Facturar" />
                            <QuickRibbonButton href="/expenses/new" icon={<TrendingDown size={16} />} text="Gasto" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main KPIs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                {/* 1. Rentabilidad Mes Actual */}
                <Card className="p-5 md:p-6 relative overflow-hidden group border-t-4 border-t-emerald-500 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={100} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                    <TrendingUp size={18} />
                                </div>
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Margen (Mes)</span>
                            </div>
                            <TrendBadge value={data.kpis.profitMom} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1">
                                {formatMoney(data.kpis.currentProfitCents, data.country)}
                            </h3>
                            <p className="text-sm text-muted-foreground">Ganancia Neta Calculada</p>
                        </div>
                    </div>
                </Card>

                {/* 2. Deuda Vencida */}
                <Card className={`p-5 md:p-6 relative overflow-hidden group border-t-4 border-t-rose-500 hover:shadow-lg transition-all ${data.kpis.overdueCount > 0 ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={100} className="text-rose-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg">
                                    <AlertCircle size={18} />
                                </div>
                                <span className="font-semibold text-rose-600">Deuda Vencida</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1">
                                {formatMoney(data.kpis.overdueSumCents, data.country)}
                            </h3>
                            <p className="text-sm text-rose-600/80 font-medium flex items-center gap-1">
                                {data.kpis.overdueCount} {data.kpis.overdueCount === 1 ? 'factura' : 'facturas'} en espera
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 3. Cobros a 7 Días */}
                <Card className="p-5 md:p-6 relative overflow-hidden group border-t-4 border-t-blue-500 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={100} className="text-blue-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                    <Clock size={18} />
                                </div>
                                <span className="font-semibold text-blue-600">Próx. 7 Días</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1">
                                {formatMoney(data.kpis.nextWeekIncomeCents, data.country)}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Proyección de {data.kpis.nextWeekIncomeCount} {data.kpis.nextWeekIncomeCount === 1 ? 'cobro' : 'cobros'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 4. Ocupación */}
                <Card className="p-5 md:p-6 relative overflow-hidden group border-t-4 border-t-indigo-500 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={100} className="text-indigo-500" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="font-semibold text-indigo-600">Ocupación</span>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="flex items-end gap-2 mb-2">
                                <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                                    {data.kpis.occupancyRate}%
                                </h3>
                                <span className="text-sm text-muted-foreground mb-1 font-medium">
                                    ({data.kpis.roomsOccupied}/{data.kpis.roomsTotal}) prop.
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 mt-2 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${data.kpis.occupancyRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={data.chartData.monthly} country={data.country} />
                </div>
                <div className="lg:col-span-1">
                    <ExpenseBreakdownChart data={data.chartData.expensesBreakdown} country={data.country} />
                </div>
            </div>

            {/* Bottom Row: Feeds and Attention Required */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Recent Activity Timeline */}
                <RecentActivityFeed activities={data.recentActivity} />

                {/* Attention Required */}
                <Card className="w-full flex flex-col h-full">
                    <div className="p-4 md:p-6 pb-2 border-b/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                                <AlertCircle size={20} />
                                Atención Requerida
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Facturas vencidas que necesitan gestión</p>
                        </div>
                    </div>
                    <div className="p-4 md:p-6 flex-1 flex flex-col gap-4">
                        {data.overdueInvoices.length > 0 ? (
                            <>
                                {data.overdueInvoices.slice(0, 4).map(inv => (
                                    <div key={inv.id} className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 min-w-[40px] rounded-full bg-rose-200/50 dark:bg-rose-800/50 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
                                                !
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{inv.lease.tenant.fullName}</p>
                                                <p className="text-xs text-rose-500/80 font-medium mt-0.5">
                                                    Venció el {inv.dueDate.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                            <span className="font-bold text-lg text-rose-700 dark:text-rose-400">
                                                {formatMoney(inv.amountCents, data.country)}
                                            </span>
                                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100" asChild>
                                                <Link href={`/invoices?tenantId=${inv.lease.tenantId}&status=OVERDUE`}>
                                                    Cobrar <ChevronRight size={16} className="ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {data.overdueInvoices.length > 4 && (
                                    <Button variant="ghost" className="w-full text-muted-foreground mt-2" asChild>
                                        <Link href="/invoices?status=OVERDUE">
                                            Ver todas las {data.overdueInvoices.length} facturas vencidas
                                        </Link>
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-70">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 mb-4">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">¡Todo al día!</h3>
                                <p className="text-muted-foreground text-sm mt-2 max-w-[250px]">
                                    No hay pagos pendientes de cobro retrasado en este momento.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// Helpers
function QuickRibbonButton({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) {
    return (
        <Link href={href}>
            <div className="flex items-center gap-2 bg-background border px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap shadow-sm">
                {icon}
                <span>{text}</span>
            </div>
        </Link>
    );
}

function TrendBadge({ value }: { value: number }) {
    const isPositive = value >= 0;
    const isZero = value === 0;

    if (isZero) {
        return (
            <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span>0% MoM</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${isPositive
                ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                : 'bg-rose-100/80 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'
            }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(value)}% MoM</span>
        </div>
    );
}
