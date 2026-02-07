'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { markInvoicePaid, unmarkInvoicePaid } from '@/actions/invoices';
import { approvePayment, rejectPayment } from '@/actions/payments';
import { Check, X, MessageSquare, AlertTriangle } from 'lucide-react';

interface Invoice {
    id: string;
    amountCents: number;
    status: string;
    dueDate: Date;
    lease: {
        rooms: { name: string }[];
        tenant: { fullName: string; phoneE164: string | null };
    };
    proof?: {
        id: string;
        method: string;
        notes: string | null;
        createdAt: Date;
    } | null;
}

interface TenantInvoiceAccordionProps {
    tenantName: string;
    invoices: Invoice[];
}

export function TenantInvoiceAccordion({ tenantName, invoices }: TenantInvoiceAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    const pendingCount = invoices.filter(inv => inv.status !== 'PAID').length;

    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors border rounded-xl shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-primary">{tenantName}</h2>
                    <Badge variant={pendingCount === 0 ? 'success' : 'secondary'}>
                        {pendingCount === 0 ? 'Al día' : `${pendingCount} pendientes`}
                    </Badge>
                </div>
                {isOpen ? <ChevronUp size={24} className="text-muted-foreground" /> : <ChevronDown size={24} className="text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="grid gap-4 pl-4 border-l-2 border-primary/20 animate-in slide-in-from-top-2 duration-200">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-lg">{formatMoney(invoice.amountCents)}</span>
                                    <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'destructive' : invoice.status === 'PAYMENT_PROCESSING' ? 'warning' : 'secondary'}>
                                        {invoice.status === 'PAID' ? 'PAGADA' : invoice.status === 'OVERDUE' ? 'VENCIDA' : invoice.status === 'PAYMENT_PROCESSING' ? 'EN REVISIÓN' : 'PENDIENTE'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {invoice.lease.rooms.map(r => r.name).join(', ')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                                    <span>
                                        Inicio: {(() => {
                                            const d = new Date(invoice.dueDate);
                                            // "Mes cumplido" -> Payment is for the previous month.
                                            // Start date is 1 month before due date.
                                            d.setMonth(d.getMonth() - 1);
                                            return d.toLocaleDateString();
                                        })()}
                                    </span>
                                    <span>•</span>
                                    <span className="capitalize">
                                        Mes: {(() => {
                                            const d = new Date(invoice.dueDate);
                                            d.setMonth(d.getMonth() - 1);
                                            return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                                        })()}
                                    </span>
                                </div>
                            </div>

                            {invoice.status === 'PAYMENT_PROCESSING' && invoice.proof ? (
                                <div className="flex flex-col items-end gap-2">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm max-w-sm">
                                        <p className="font-semibold text-amber-800 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Pago declarado ({invoice.proof.method === 'BANK' ? 'Transferencia' : 'Efectivo'})
                                        </p>
                                        {invoice.proof.notes && (
                                            <p className="text-amber-700 mt-1 italic flex items-start gap-1">
                                                <MessageSquare size={12} className="mt-0.5" /> "{invoice.proof.notes}"
                                            </p>
                                        )}
                                        <p className="text-xs text-amber-600/70 mt-2">
                                            Declarado el {new Date(invoice.proof.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={async () => {
                                                if (confirm('¿Rechazar este pago? La factura volverá a estar pendiente.')) {
                                                    await rejectPayment(invoice.proof!.id);
                                                }
                                            }}
                                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                        >
                                            <X size={16} className="mr-1" /> Rechazar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={async () => {
                                                await approvePayment(invoice.proof!.id);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Check size={16} className="mr-1" /> Validar Pago
                                        </Button>
                                    </div>
                                </div>
                            ) : invoice.status !== 'PAID' ? (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const phone = invoice.lease.tenant.phoneE164?.replace('+', '') || '';
                                            const tenantName = invoice.lease.tenant.fullName.split(' ')[0];
                                            const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                                            const amount = formatMoney(invoice.amountCents);
                                            const concept = invoice.lease.rooms.map(r => r.name).join(', ');

                                            let text = '';
                                            if (invoice.status === 'OVERDUE') {
                                                text = `Hola ${tenantName}, te informo que la factura de ${concept} venció el ${dueDate} y tienes un saldo pendiente de ${amount}. Por favor realiza el pago lo antes posible.`;
                                            } else {
                                                text = `Hola ${tenantName}, te recuerdo que el alquiler de ${concept} vence el ${dueDate} por un monto de ${amount}. Saludos.`;
                                            }

                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className={`gap-2 ${invoice.status === 'OVERDUE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                                        title="Enviar mensaje por WhatsApp"
                                    >
                                        <MessageSquare size={16} /> {invoice.status === 'OVERDUE' ? 'Reclamar' : 'Recordar'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            await markInvoicePaid(invoice.id);
                                        }}
                                        className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                    >
                                        <CheckCircle size={16} /> Pagada
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                        if (confirm('¿Estás seguro de que quieres deshacer este pago? Se borrará el registro de pago.')) {
                                            await unmarkInvoicePaid(invoice.id);
                                        }
                                    }}
                                    className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    Deshacer Pago
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>
            )
            }
        </div >
    );
}
