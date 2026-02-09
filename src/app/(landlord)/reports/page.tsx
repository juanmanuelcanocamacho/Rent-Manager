import { replyMessage, closeMessage, deleteMessage } from '@/actions/messages';
import { approvePayment, rejectPayment } from '@/actions/payments';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Badge, Button, Card } from '@/components/ui/shared';
import { MessageSquare, XCircle, Send, AlertTriangle, Check, X, FileText, Trash } from 'lucide-react';
import { formatMoney } from '@/lib/money';
import ReportGenerator from '@/components/reports/ReportGenerator';

export default async function ReportsPage() {
    await requireLandlord();

    // Fetch Messages
    const messages = await db.message.findMany({
        include: { tenant: true, lease: { include: { rooms: true } } },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });

    // Fetch Pending Payments
    const pendingPayments = await db.invoice.findMany({
        // @ts-ignore
        where: { status: 'PAYMENT_PROCESSING' },
        include: {
            proof: true,
            lease: { include: { tenant: true, rooms: true } }
        },
        // @ts-ignore
        orderBy: { createdAt: 'desc' }
    });

    // Fetch Tenants for Report Filter
    const tenants = await db.tenantProfile.findMany({
        select: { id: true, fullName: true },
        orderBy: { fullName: 'asc' }
    });

    return (
        <div className="space-y-10 animate-in fade-in">
            {/* Report Generator */}
            <ReportGenerator tenants={tenants} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Reportes y Validaciones</h1>
                <p className="text-muted-foreground">Gestiona incidencias y pagos pendientes de validación.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* COLUMN 1: PENDING PAYMENTS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Validar Pagos</h2>
                        <Badge variant="secondary" className="ml-auto">{pendingPayments.length}</Badge>
                    </div>

                    <div className="space-y-4">
                        {pendingPaymentsDots(pendingPayments)}
                    </div>
                </div>

                {/* COLUMN 2: INCIDENTS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-xl font-semibold">Incidencias</h2>
                        <Badge variant="secondary" className="ml-auto">{messages.length}</Badge>
                    </div>

                    <div className="space-y-4">
                        {messagesDots(messages)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function pendingPaymentsDots(payments: any[]) {
    if (payments.length === 0) return <p className="text-muted-foreground italic text-sm">No hay pagos pendientes de validación.</p>;

    return payments.map(invoice => (
        <Card key={invoice.id} className="p-5 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-lg">{invoice.lease.tenant.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{invoice.lease.rooms.map((r: any) => r.name).join(', ')}</p>
                </div>
                <Badge variant="warning" className="animate-pulse">EN REVISIÓN</Badge>
            </div>

            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-amber-900">Monto Declarado</span>
                    <span className="font-mono font-bold text-lg">{formatMoney(invoice.amountCents)}</span>
                </div>
                <div className="text-sm text-amber-800 space-y-1">
                    <p className="flex items-center gap-2">
                        <CreditCardIcon method={invoice.proof?.method} />
                        {invoice.proof?.method === 'BANK' ? 'Transferencia Bancaria' : 'Pago en Efectivo'}
                    </p>
                    {invoice.proof?.notes && (
                        <p className="italic text-amber-700/80 pl-6 border-l-2 border-amber-300/50 ml-1">"{invoice.proof.notes}"</p>
                    )}
                    <p className="text-xs text-muted-foreground pt-1 text-right">
                        {new Date(invoice.proof?.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <form action={async () => {
                    'use server';
                    if (invoice.proof?.id) await rejectPayment(invoice.proof.id);
                }}>
                    <Button variant="ghost" size="sm" type="submit" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <X size={16} className="mr-1" /> Rechazar
                    </Button>
                </form>

                <form action={async () => {
                    'use server';
                    if (invoice.proof?.id) await approvePayment(invoice.proof.id);
                }}>
                    <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200">
                        <Check size={16} className="mr-1" /> Validar
                    </Button>
                </form>
            </div>
        </Card>
    ));
}

function messagesDots(messages: any[]) {
    if (messages.length === 0) return <p className="text-muted-foreground italic text-sm">No hay incidencias reportadas.</p>;

    return messages.map((msg) => (
        <Card key={msg.id} className={`p-5 shadow-sm hover:shadow-md transition-shadow ${msg.status === 'OPEN' ? 'border-l-4 border-l-blue-500' : 'opacity-80'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-sm">{msg.tenant.fullName}</h3>
                    <p className="text-xs text-muted-foreground">{msg.lease.rooms.map((r: any) => r.name).join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={msg.status === 'OPEN' ? 'warning' : 'secondary'} className="text-[10px]">{msg.status}</Badge>
                    <form action={async () => {
                        'use server';
                        await deleteMessage(msg.id);
                    }}>
                        <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-red-500 hover:bg-red-50 h-6 w-6 p-0 rounded-full" title="Borrar reporte">
                            <Trash size={14} />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg text-sm mb-4 relative">
                <MessageSquare size={14} className="absolute left-3 top-3.5 text-muted-foreground" />
                <p className="pl-6 text-foreground/90 leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground text-right mt-2">{msg.createdAt.toLocaleDateString()}</p>
            </div>

            {msg.adminReply ? (
                <div className="ml-8 bg-primary/5 p-3 rounded-lg text-sm border border-primary/10">
                    <p className="font-bold text-xs text-primary mb-1 flex items-center gap-1"><Send size={10} /> Respuesta:</p>
                    <p className="text-foreground/80">{msg.adminReply}</p>
                </div>
            ) : (
                msg.status === 'OPEN' && (
                    <div className="ml-2">
                        <form action={async (formData) => {
                            'use server';
                            const reply = formData.get('reply') as string;
                            await replyMessage(msg.id, reply);
                        }} className="flex gap-2">
                            <input name="reply" placeholder="Escribir respuesta..." className="flex-1 text-xs border rounded-lg px-3 py-2 bg-background focus:ring-1 focus:ring-primary outline-none" required />
                            <Button size="sm" type="submit" className="h-8 w-8 p-0"><Send size={14} /></Button>
                        </form>
                        <form action={async () => {
                            'use server';
                            await closeMessage(msg.id);
                        }} className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" type="submit" className="text-xs text-muted-foreground hover:text-red-500 h-6 px-2">
                                <XCircle size={12} className="mr-1" /> Cerrar Ticket
                            </Button>
                        </form>
                    </div>
                )
            )}
        </Card>
    ));
}

function CreditCardIcon({ method }: { method: string }) {
    if (method === 'BANK') return <FileText size={16} className="text-amber-700" />;
    return <FileText size={16} className="text-amber-700" />; // Fallback icon
}
