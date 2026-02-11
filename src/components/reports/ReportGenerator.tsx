'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/shared';
import { getInvoicesForReport } from '@/actions/reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Loader2 } from 'lucide-react';
import { formatMoney } from '@/lib/money';

type TenantOption = {
    id: string;
    fullName: string;
};

export default function ReportGenerator({ tenants, condensed = false }: { tenants: TenantOption[]; condensed?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');

    const generatePDF = async () => {
        try {
            setLoading(true);

            // Fetch data
            const invoices = await getInvoicesForReport({
                tenantId: selectedTenant === 'ALL' ? undefined : selectedTenant,
                status: selectedStatus === 'ALL' ? undefined : selectedStatus,
            });

            // Calculate totals
            const totalAmount = invoices.reduce((sum, inv) => sum + inv.amountCents, 0);
            const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.amountCents, 0);
            const pendingAmount = totalAmount - paidAmount;
            const overdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, inv) => sum + inv.amountCents, 0);

            // Generate PDF
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Reporte de Facturación', 14, 22);

            doc.setFontSize(10);
            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
            if (selectedTenant !== 'ALL') {
                const tenantName = tenants.find(t => t.id === selectedTenant)?.fullName || 'Desconocido';
                doc.text(`Inquilino: ${tenantName}`, 14, 35);
            }
            doc.text(`Estado: ${selectedStatus === 'ALL' ? 'Todos' : selectedStatus}`, 14, 40);

            // Summary Box
            doc.setDrawColor(200);
            doc.setFillColor(245, 245, 245);
            doc.rect(14, 45, 180, 30, 'FD'); // Increased height

            doc.setFontSize(12);
            doc.text('Resumen', 20, 52);
            doc.setFontSize(10);

            // Row 1
            doc.text(`Total Facturado: ${formatMoney(totalAmount)}`, 20, 60);
            doc.text(`Pagado: ${formatMoney(paidAmount)}`, 100, 60);

            // Row 2
            doc.text(`Pendiente Total: ${formatMoney(pendingAmount)}`, 20, 68);

            // Overdue in Red
            doc.setTextColor(231, 76, 60); // Red
            doc.text(`Deuda Vencida: ${formatMoney(overdueAmount)}`, 100, 68);
            doc.setTextColor(0, 0, 0); // Reset to Black

            // Table
            const translateStatus = (status: string) => {
                const map: Record<string, string> = {
                    'PAID': 'Pagado',
                    'PENDING': 'Pendiente',
                    'OVERDUE': 'Vencido',
                    'PAYMENT_PROCESSING': 'En Proceso'
                };
                return map[status] || status;
            };

            const tableData = invoices.map(inv => [
                new Date(inv.dueDate).toLocaleDateString(),
                inv.lease.tenant.fullName,
                inv.lease.rooms.map((r: any) => r.name).join(', '),
                formatMoney(inv.amountCents),
                translateStatus(inv.status),
                inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'
            ]);

            autoTable(doc, {
                startY: 85,
                head: [['Fecha Venc.', 'Inquilino', 'Habitación', 'Monto', 'Estado', 'Pagado el']],
                body: tableData,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [41, 128, 185] },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 4) {
                        const status = data.cell.raw as string;
                        if (status === 'Pagado') {
                            data.cell.styles.textColor = [46, 204, 113]; // Green
                        } else if (status === 'Vencido') {
                            data.cell.styles.textColor = [231, 76, 60]; // Red
                        } else if (status === 'Pendiente') {
                            data.cell.styles.textColor = [0, 0, 0]; // Black
                        }
                    }
                }
            });

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
            }

            doc.save(`reporte_facturacion_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error(error);
            alert('Error al generar el reporte PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={condensed ? "" : "bg-card p-6 rounded-xl border shadow-sm space-y-4 mb-8"}>
            {condensed ? (
                <div className="flex items-center gap-2">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-40"
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                    >
                        <option value="ALL">Inquilino: Todos</option>
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                    </select>
                    <Button onClick={generatePDF} disabled={loading} size="sm" variant="outline" className="h-9">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />} PDF
                    </Button>
                </div>
            ) : (
                <>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        Generador de facturas (PDF)
                    </h2>

                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Inquilino</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedTenant}
                                onChange={(e) => setSelectedTenant(e.target.value)}
                            >
                                <option value="ALL">Todos los Inquilinos</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.fullName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Estado</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as any)}
                            >
                                <option value="ALL">Todos</option>
                                <option value="PAID">Pagados</option>
                                <option value="PENDING">Pendientes</option>
                                <option value="OVERDUE">Vencidos</option>
                            </select>
                        </div>

                        <Button onClick={generatePDF} disabled={loading} className="w-full md:w-auto">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" /> Descargar PDF
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
