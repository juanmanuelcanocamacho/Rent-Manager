'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { markInvoicePaid } from '@/actions/invoices';

interface Invoice {
    id: string;
    amountCents: number;
    status: string;
    dueDate: Date;
    lease: {
        rooms: { name: string }[];
    };
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
                                    <Badge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                                        {invoice.status === 'PAID' ? 'PAGADA' : invoice.status === 'OVERDUE' ? 'VENCIDA' : 'PENDIENTE'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {invoice.lease.rooms.map(r => r.name).join(', ')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                                </div>
                            </div>

                            {invoice.status !== 'PAID' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        await markInvoicePaid(invoice.id);
                                    }}
                                    className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
                                >
                                    <CheckCircle size={16} /> Marcar Pagada
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
