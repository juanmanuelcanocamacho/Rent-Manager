import { db } from '@/lib/db';
import { Card, Badge, Button } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { CheckCircle, AlertTriangle, Building, Home, Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function VerifyInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            lease: {
                include: {
                    tenant: true,
                    rooms: true,
                    landlord: true,
                }
            }
        }
    });

    if (!invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Recibo no encontrado</h1>
                    <p className="text-muted-foreground">
                        El código escaneado no corresponde a ningún recibo válido emitido por nuestro sistema.
                    </p>
                    <Button asChild className="w-full mt-4">
                        <Link href="/">Ir a Inicio</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const isPaid = invoice.status === 'PAID';

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="max-w-md w-full p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 pb-0
                        ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}">
                        {isPaid ? <CheckCircle size={32} className="text-emerald-600" /> : <AlertTriangle size={32} className="text-amber-600" />}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isPaid ? 'Recibo Auténtico' : 'Recibo Pendiente'}
                    </h1>
                    <p className="text-sm text-slate-600">
                        {isPaid 
                            ? 'Este recibo ha sido emitido y verificado por Llavia.' 
                            : 'Este recibo existe pero aún no registra un pago validado.'}
                    </p>
                </div>

                <div className="bg-slate-100 rounded-xl p-6 space-y-4">
                    <div className="text-center border-b border-slate-200 pb-4">
                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Importe</p>
                        <p className="text-4xl font-black text-slate-900">{formatMoney(invoice.amountCents)}</p>
                        {isPaid && invoice.paidAt && (
                            <Badge variant="success" className="mt-2">Pagado el {new Date(invoice.paidAt).toLocaleDateString()}</Badge>
                        )}
                        {!isPaid && (
                            <Badge variant="warning" className="mt-2">Pendiente</Badge>
                        )}
                    </div>

                    <div className="space-y-3 pt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                            <Home size={16} className="text-slate-400" />
                            <span><strong className="text-slate-900">Propiedad:</strong> {invoice.lease.rooms.map(r => r.name).join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building size={16} className="text-slate-400" />
                            <span><strong className="text-slate-900">Propietario:</strong> {invoice.lease.landlord.name || 'Llavia'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-slate-400" />
                            <span><strong className="text-slate-900">Vencimiento:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-400">Verificado el {new Date().toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {invoice.id.substring(0, 12)}...</p>
                </div>
            </Card>
        </div>
    );
}
