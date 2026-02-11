'use client';

import { formatMoney } from '@/lib/money';
import { Badge, Button } from '@/components/ui/shared';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { markInvoicePaid, unmarkInvoicePaid } from '@/actions/invoices';
import { approvePayment, rejectPayment } from '@/actions/payments';
import { generateInvoiceReceipt } from '@/lib/pdf/invoice-receipt';
import { Check, X, MessageSquare, AlertTriangle, CheckCircle, FileDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface InvoiceItemProps {
    invoice: any; // Using any for now to avoid complex type duplication, ideally should use Prisma type
}

export function InvoiceItem({ invoice }: InvoiceItemProps) {
    const [loading, setLoading] = useState(false);

    const isPaid = invoice.status === 'PAID';
    const isOverdue = invoice.status === 'OVERDUE';
    const isPending = invoice.status === 'PENDING';
    const isProcessing = invoice.status === 'PAYMENT_PROCESSING';

    const handleAction = async (action: () => Promise<void>) => {
        setLoading(true);
        try {
            await action();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
            {/* 1. Info Principal */}
            <div className="flex-1 w-full md:w-auto">
                <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg">{formatMoney(invoice.amountCents)}</span>
                    <Badge variant={isPaid ? 'success' : isOverdue ? 'destructive' : isProcessing ? 'warning' : 'secondary'}>
                        {isPaid ? 'PAGADA' : isOverdue ? 'VENCIDA' : isProcessing ? 'EN REVISIÓN' : 'PROGRAMADA'}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{invoice.lease.rooms.map((r: any) => r.name).join(', ')}</span>
                    <span>•</span>
                    <span className="capitalize">
                        {new Date(invoice.dueDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                {isOverdue && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                        Venció el {new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                )}
            </div>

            {/* 2. Acciones Contextuales */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                {/* Caso: En Revisión (Tiene comprobante) */}
                {isProcessing && invoice.proof && (
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-amber-600 mr-2 flex flex-col items-end">
                            <span className="font-medium flex items-center gap-1"><AlertTriangle size={10} /> Pago declarado</span>
                            <span className="opacity-70">{new Date(invoice.proof.createdAt).toLocaleDateString()}</span>
                        </div>
                        <ConfirmDialog
                            trigger={
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                                    <X size={16} />
                                </Button>
                            }
                            title="Rechazar Pago"
                            description="¿Rechazar este comprobante? La factura volverá a estar pendiente."
                            onConfirm={() => handleAction(() => rejectPayment(invoice.proof.id))}
                            variant="destructive"
                        />
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                            onClick={() => handleAction(() => approvePayment(invoice.proof.id))}
                            disabled={loading}
                        >
                            <Check size={14} className="mr-1" /> Validar
                        </Button>
                    </div>
                )}

                {/* Caso: Vencida o Pendiente */}
                {(isOverdue || isPending) && (
                    <>
                        {/* WhatsApp Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className={`h-8 ${isOverdue ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => {
                                const phone = invoice.lease.tenant.phoneE164?.replace('+', '') || '';
                                const tenantName = invoice.lease.tenant.fullName.split(' ')[0];
                                const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                                const amount = formatMoney(invoice.amountCents);
                                const concept = invoice.lease.rooms.map((r: any) => r.name).join(', ');

                                let text = isOverdue
                                    ? `Hola ${tenantName}, la factura de ${concept} por ${amount} venció el ${dueDate}. Por favor realiza el pago.`
                                    : `Hola ${tenantName}, recordatorio del alquiler de ${concept} por ${amount} para el ${dueDate}.`;

                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                        >
                            <MessageSquare size={14} className="mr-1.5" />
                            {isOverdue ? 'Reclamar' : 'Recordar'}
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleAction(() => markInvoicePaid(invoice.id))}
                            disabled={loading}
                        >
                            <CheckCircle size={14} className="mr-2" />
                            Marcar Pagada
                        </Button>
                    </>
                )}

                {/* Caso: Pagada */}
                {isPaid && (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-primary hover:bg-primary/10"
                            onClick={() => generateInvoiceReceipt({
                                id: invoice.id,
                                amountCents: invoice.amountCents,
                                dueDate: invoice.dueDate,
                                paidAt: invoice.paidAt,
                                tenantName: invoice.lease.tenant.fullName,
                                rooms: invoice.lease.rooms.map((r: any) => r.name)
                            })}
                        >
                            <FileDown size={14} className="mr-1.5" /> Recibo
                        </Button>

                        <ConfirmDialog
                            trigger={
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                    <RotateCcw size={14} />
                                </Button>
                            }
                            title="Deshacer Pago"
                            description="¿Marcar esta factura como pendiente nuevamente?"
                            onConfirm={() => handleAction(() => unmarkInvoicePaid(invoice.id))}
                            variant="destructive"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
