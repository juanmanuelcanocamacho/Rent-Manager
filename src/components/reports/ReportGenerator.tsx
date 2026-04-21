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
            const pageWidth = doc.internal.pageSize.getWidth();

            // Color Palette based on Llavia brand (Indigo/Slate)
            const primaryColor: [number, number, number] = [99, 102, 241]; 
            const slateDark: [number, number, number] = [30, 41, 59];      
            const slateMed: [number, number, number] = [100, 116, 139];    
            const slateLight: [number, number, number] = [248, 250, 252];  
            const successColor: [number, number, number] = [34, 197, 94];  
            const dangerColor: [number, number, number] = [239, 68, 68];

            // 1. Header & Branding
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 2, 'F');

            doc.setFillColor(...primaryColor);
            doc.roundedRect(20, 15, 12, 12, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('L', 26, 23.5, { align: 'center' });

            doc.setTextColor(...slateDark);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('LLAVIA', 36, 24.5);

            doc.setTextColor(...slateMed);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Gestión Integral de Alquileres', 36, 29);

            // Report Title
            doc.setTextColor(...primaryColor);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE FACTURACIÓN', pageWidth - 20, 22, { align: 'right' });

            doc.setFontSize(9);
            doc.setTextColor(...slateMed);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth - 20, 28, { align: 'right' });

            // 2. Summary Cards
            const summaryY = 42;
            const cardWidth = (pageWidth - 40 - 10) / 3; 

            // Card 1: Facturado
            doc.setFillColor(...slateLight);
            doc.roundedRect(20, summaryY, cardWidth, 18, 2, 2, 'F');
            doc.setTextColor(...slateMed);
            doc.setFontSize(7);
            doc.text('TOTAL FACTURADO', 20 + cardWidth/2, summaryY + 7, { align: 'center' });
            doc.setTextColor(...slateDark);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(formatMoney(totalAmount), 20 + cardWidth/2, summaryY + 14, { align: 'center' });

            // Card 2: Pagado
            doc.setFillColor(240, 253, 244); 
            doc.roundedRect(20 + cardWidth + 5, summaryY, cardWidth, 18, 2, 2, 'F');
            doc.setTextColor(...successColor);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('TOTAL PAGADO', 20 + cardWidth + 5 + cardWidth/2, summaryY + 7, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(formatMoney(paidAmount), 20 + cardWidth + 5 + cardWidth/2, summaryY + 14, { align: 'center' });

            // Card 3: Vencido
            doc.setFillColor(254, 242, 242); 
            doc.roundedRect(20 + (cardWidth + 5)*2, summaryY, cardWidth, 18, 2, 2, 'F');
            doc.setTextColor(...dangerColor);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text('DEUDA VENCIDA', 20 + (cardWidth + 5)*2 + cardWidth/2, summaryY + 7, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(formatMoney(overdueAmount), 20 + (cardWidth + 5)*2 + cardWidth/2, summaryY + 14, { align: 'center' });

            // Filters label
            const translateStatus = (status: string) => {
                const map: Record<string, string> = {
                    'PAID': 'Pagado',
                    'PENDING': 'Pendiente',
                    'OVERDUE': 'Vencido',
                    'PAYMENT_PROCESSING': 'En Proceso'
                };
                return map[status] || status;
            };

            doc.setTextColor(...slateMed);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const tenantText = selectedTenant === 'ALL' ? 'Todos' : (tenants.find(t => t.id === selectedTenant)?.fullName || 'Desconocido');
            const filterText = `Filtros Aplicados  —  Inquilino: ${tenantText}   |   Estado: ${selectedStatus === 'ALL' ? 'Todos' : translateStatus(selectedStatus)}`;
            doc.text(filterText, 20, summaryY + 28);

            // 3. Table
            const tableData = invoices.map(inv => [
                new Date(inv.dueDate).toLocaleDateString(),
                inv.lease.tenant.fullName,
                inv.lease.rooms.map((r: any) => r.name).join(', '),
                formatMoney(inv.amountCents),
                translateStatus(inv.status),
                inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'
            ]);

            autoTable(doc, {
                startY: summaryY + 33,
                head: [['Fecha Venc.', 'Inquilino', 'Habitación', 'Monto', 'Estado', 'Pagado el']],
                body: tableData,
                styles: { 
                    font: 'helvetica', 
                    fontSize: 8,
                    textColor: slateDark,
                    cellPadding: 4,
                },
                headStyles: { 
                    fillColor: primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: slateLight
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 4) {
                        const status = data.cell.raw as string;
                        if (status === 'Pagado') {
                            data.cell.styles.textColor = successColor;
                            data.cell.styles.fontStyle = 'bold';
                        } else if (status === 'Vencido') {
                            data.cell.styles.textColor = dangerColor;
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            // 4. Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                
                doc.setDrawColor(241, 245, 249);
                doc.setLineWidth(0.5);
                doc.line(20, 280, pageWidth - 20, 280);

                doc.setTextColor(...slateMed);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text('Llavia - Sistema Integral para Propietarios', 20, 286);
                
                doc.setTextColor(...primaryColor);
                doc.setFont('helvetica', 'bold');
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, 286, { align: 'right' });
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
