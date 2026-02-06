'use client';

import { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { declarePayment } from '@/actions/payments';
import { CheckCircle, Clock, AlertTriangle, Banknote, Building, Loader2 } from 'lucide-react';

interface Invoice {
    id: string;
    amountCents: number;
    status: string; // "PENDING" | "PAID" | "OVERDUE" | "PAYMENT_PROCESSING"
    dueDate: Date;
    paidAt: Date | null;
}

export function TenantInvoiceCard({ invoice }: { invoice: Invoice }) {
    const [isDeclaring, setIsDeclaring] = useState(false);
    const [method, setMethod] = useState<'CASH' | 'BANK'>('BANK');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDeclare = async () => {
        setIsLoading(true);
        try {
            await declarePayment(invoice.id, method, notes);
            setIsDeclaring(false);
        } catch (error) {
            alert("Error al declarar el pago: " + error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <Badge variant="success">PAGADA</Badge>;
            case 'OVERDUE':
                return <Badge variant="destructive">VENCIDA</Badge>;
            case 'PAYMENT_PROCESSING':
                return <Badge variant="warning" className="animate-pulse">⏳ REVISANDO</Badge>;
            default:
                return <Badge variant="secondary">PENDIENTE</Badge>;
        }
    };

    return (
        <Card className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{formatMoney(invoice.amountCents)}</span>
                        {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="text-right text-xs">
                    {invoice.paidAt ? (
                        <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Pagado el {new Date(invoice.paidAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    ) : (
                        invoice.status === 'PAYMENT_PROCESSING' ? (
                            <span className="text-amber-600 flex items-center gap-1">
                                <Clock size={12} /> Esperando validación
                            </span>
                        ) : (
                            <span className="text-muted-foreground">Pendiente de pago</span>
                        )
                    )}
                </div>
            </div>

            {/* Actions */}
            {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && !isDeclaring && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        onClick={() => setIsDeclaring(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Informar Pago
                    </Button>
                </div>
            )}

            {/* Declaration Form */}
            {isDeclaring && (
                <div className="bg-muted/30 p-4 rounded-lg border animate-in slide-in-from-top-2">
                    <h4 className="font-semibold text-sm mb-3">Informar Pago Realizado</h4>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMethod('BANK')}
                                className={`text-sm p-3 rounded-md border flex flex-col items-center gap-2 transition-all ${method === 'BANK'
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-background hover:bg-muted'
                                    }`}
                            >
                                <Building size={20} />
                                Transferencia
                            </button>
                            <button
                                onClick={() => setMethod('CASH')}
                                className={`text-sm p-3 rounded-md border flex flex-col items-center gap-2 transition-all ${method === 'CASH'
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-background hover:bg-muted'
                                    }`}
                            >
                                <Banknote size={20} />
                                Efectivo
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-medium mb-1 block">Nota Opcional</label>
                            <Input
                                placeholder={method === 'BANK' ? "Ej: Enviado desde BBVA..." : "Ej: Entregado a Juan..."}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDeclaring(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDeclare}
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {isLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                                Confirmar Envío
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
