'use client';

import { Card, Button } from '@/components/ui/shared';
import Link from 'next/link';
import { formatMoney } from '@/lib/money';
import { AlertCircle, Clock, Key, Phone, UserPlus, FileText, CreditCard, Wrench, ArrowRight } from 'lucide-react';

interface ManagerDashboardProps {
    data: {
        country: 'SPAIN' | 'BOLIVIA';
        profileName?: string;
        profileEmail: string;
        aggregatedOverdue: any[];
        expiringLeases: any[];
        availableRooms: any[];
    };
}

export function ManagerDashboardUI({ data }: ManagerDashboardProps) {
    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12 w-full max-w-lg md:max-w-4xl mx-auto px-1">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2 flex-wrap">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
                        Hola {data.profileName}
                    </span>
                    <span>👋</span>
                </h1>
                <p className="text-muted-foreground font-medium text-sm">
                    Aquí tienes tu agenda operativa para hoy.
                </p>
            </div>

            {/* Quick Actions (2x2 Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <QuickAction href="/manager/invoices" icon={<CreditCard size={20} />} text="Añadir Pago" />
                <QuickAction href="/manager/expenses/new" icon={<Wrench size={20} />} text="Reportar Gasto" />
                <QuickAction href="/manager/tenants/new" icon={<UserPlus size={20} />} text="Crear Inquilino" />
                <QuickAction href="/manager/leases/new" icon={<FileText size={20} />} text="Nuevo Contrato" />
            </div>

            {/* 1. Radar Rojo: Deudas Vencidas */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Prioridad Alta (Cobros)
                    </h2>
                </div>
                {data.aggregatedOverdue.length === 0 ? (
                    <EmptyState text="No hay cobros físicos pendientes por gestionar hoy." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.aggregatedOverdue.map((item, idx) => (
                            <Card key={idx} className="p-4 border-l-4 border-l-rose-500 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <AlertCircle size={80} className="text-rose-500" />
                                </div>
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{item.tenantName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.roomName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-rose-600 text-lg leading-none">{formatMoney(item.totalAmountCents, data.country)}</p>
                                            <p className="text-[10px] font-medium text-rose-500/80 uppercase tracking-wide mt-1">{item.invoicesCount} factura(s)</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {item.tenantPhone ? (
                                            <Button size="sm" variant="outline" className="flex-1 gap-2 border-rose-200 text-rose-700 hover:bg-rose-50" asChild>
                                                <a href={`tel:${item.tenantPhone}`}>
                                                    <Phone size={14} /> Llamar
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="flex-1 gap-2 border-slate-200" disabled>
                                                <Phone size={14} /> Sin Telf.
                                            </Button>
                                        )}
                                        <Button size="sm" variant="secondary" className="flex-1 gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm" asChild>
                                            <Link href={`/manager/invoices?search=${encodeURIComponent(item.tenantName)}`}>
                                                Gestionar
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Radar Amarillo: Contratos */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Prioridad Media (Contratos)
                    </h2>
                </div>
                {data.expiringLeases.length === 0 ? (
                    <EmptyState text="Ningún contrato vence en los próximos 30 días." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.expiringLeases.map((lease: any) => {
                            const daysLeft = Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            const isUrgent = daysLeft <= 7;
                            return (
                                <Card key={lease.id} className="p-4 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-sm flex justify-between items-center group hover:bg-amber-50/10 transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-100">{lease.tenant.fullName}</p>
                                        <p className={`text-xs flex items-center gap-1 mt-0.5 font-medium ${isUrgent ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                            <Clock size={12} /> {daysLeft < 0 ? `Vencido hace ${Math.abs(daysLeft)} días` : `Vence en ${daysLeft} días`}
                                        </p>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50" asChild>
                                        <Link href={`/manager/leases/${lease.id}`}>
                                            Ver <ArrowRight size={14} className="ml-1" />
                                        </Link>
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 3. Radar Azul: Disponibilidad */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                        Habitaciones Libres
                    </h2>
                </div>
                {data.availableRooms.length === 0 ? (
                    <EmptyState text="Ocupación al 100%. No hay habitaciones registradas como disponibles." />
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {data.availableRooms.map((room: any) => (
                            <Card key={room.id} className="min-w-[140px] p-4 flex flex-col justify-center items-center text-center gap-2 shadow-sm bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 flex items-center justify-center">
                                    <Key size={18} />
                                </div>
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate w-full">{room.name}</p>
                                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">Disponible</span>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

function QuickAction({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
    return (
        <Link href={href} className="group flex-1">
            <div className="flex flex-col items-center justify-center gap-2 bg-card border border-border/50 hover:border-primary/30 p-3 sm:p-4 rounded-[20px] hover:bg-primary/[0.02] shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {icon}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-foreground text-center tracking-wide">{text}</span>
            </div>
        </Link>
    );
}

function EmptyState({ text }: { text: string; }) {
    return (
        <div className="p-6 rounded-2xl border border-dashed text-center bg-muted/20">
            <p className="text-sm text-muted-foreground font-medium">{text}</p>
        </div>
    );
}
