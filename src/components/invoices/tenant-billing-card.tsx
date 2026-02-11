'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui/shared';
import { User, Calendar, AlertCircle } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import { InvoiceItem } from './invoice-item';

interface TenantBillingCardProps {
    tenantName: string;
    invoices: any[]; // Using any for simplicity in this migration step
}

export function TenantBillingCard({ tenantName, invoices }: TenantBillingCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Calculate States
    const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
    const pendingInvoices = invoices.filter(i => i.status === 'PENDING' || i.status === 'PAYMENT_PROCESSING');
    const paidInvoices = invoices.filter(i => i.status === 'PAID');

    // Sort logic: Overdue first, then Pending (asc date), then Paid (desc date)
    const sortedInvoices = [...invoices].sort((a, b) => {
        const order: Record<string, number> = { 'OVERDUE': 1, 'PAYMENT_PROCESSING': 2, 'PENDING': 3, 'PAID': 4 };
        if (order[a.status] !== order[b.status]) return (order[a.status] || 99) - (order[b.status] || 99);
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const totalDebt = overdueInvoices.reduce((acc, curr) => acc + curr.amountCents, 0);
    const hasDebt = totalDebt > 0;

    // Next payment logic
    const nextInvoice = pendingInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    return (
        <Card className={`overflow-hidden transition-all duration-300 ${hasDebt ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'}`}>
            <div className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    {/* Header Info */}
                    <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${hasDebt ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{tenantName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {hasDebt ? (
                                    <Badge variant="destructive" className="animate-pulse">
                                        Debe {formatMoney(totalDebt)}
                                    </Badge>
                                ) : (
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white mr-1" /> Al día
                                    </Badge>
                                )}
                                {overdueInvoices.length > 0 && (
                                    <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
                                        <AlertCircle size={12} /> {overdueInvoices.length} vencidas
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Info / Action */}
                    <div className="flex flex-col md:items-end gap-1 w-full md:w-auto">
                        {!hasDebt && nextInvoice && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Próximo cobro</p>
                                <p className="font-medium text-sm flex items-center gap-1.5 justify-end">
                                    <Calendar size={14} className="text-blue-500" />
                                    {new Date(nextInvoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    <span className="text-muted-foreground">•</span>
                                    {formatMoney(nextInvoice.amountCents)}
                                </p>
                            </div>
                        )}

                        <Button
                            variant={hasDebt ? "destructive" : "outline"}
                            size="sm"
                            className="mt-2 w-full md:w-auto"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? "Ocultar detalles" : hasDebt ? "Gestionar Deuda" : "Ver Historial"}
                        </Button>
                    </div>
                </div>

                {/* Expanded Invoice List */}
                {expanded && (
                    <div className="pt-6 mt-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Facturas & Pagos</h4>
                        {sortedInvoices.map(inv => (
                            <InvoiceItem key={inv.id} invoice={inv} />
                        ))}
                        {sortedInvoices.length === 0 && (
                            <p className="text-sm italic text-muted-foreground">No hay facturas registradas.</p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
