import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatMoney } from '@/lib/money';

interface InvoiceData {
    id: string;
    amountCents: number;
    dueDate: Date;
    paidAt?: Date | null;
    tenantName: string;
    rooms: string[];
}

export function generateInvoiceReceipt(data: InvoiceData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Color Palette
    const primaryColor: [number, number, number] = [41, 128, 185]; // Professional Blue
    const secondaryColor: [number, number, number] = [100, 100, 100]; // Grey
    const successColor: [number, number, number] = [46, 204, 113]; // Green

    // 1. Header & Branding
    // Top Bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RENT MANAGER', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Alquileres', 20, 32);

    // Document Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE PAGO', pageWidth - 20, 60, { align: 'right' });

    // 2. Main Info Section (using columns)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('EMITIDO PARA:', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(data.tenantName, 20, 76);

    // Reference and Date on the right
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCIA:', pageWidth - 80, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(data.id, pageWidth - 80, 76);

    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE EMISIÓN:', pageWidth - 80, 83);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('es-ES'), pageWidth - 80, 89);

    // 3. Details Table
    const periodStr = (() => {
        const d = new Date(data.dueDate);
        d.setMonth(d.getMonth() - 1);
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    })();

    autoTable(doc, {
        startY: 100,
        head: [['CONCEPTO', 'FECHA VENC.', 'MONTO']],
        body: [
            [
                { content: `Alquiler: ${data.rooms.join(', ')}\nPeriodo: ${periodStr}`, styles: { cellPadding: 5 } },
                new Date(data.dueDate).toLocaleDateString('es-ES'),
                formatMoney(data.amountCents)
            ]
        ],
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: 'left'
        },
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold' }
        },
        styles: {
            fontSize: 9,
            cellPadding: 4
        }
    });

    // 4. Totals and Payment Confirmation
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Total Box (Properly aligned with no overlap)
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth - 90, finalY, 70, 25, 'F');

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL RECIBIDO', pageWidth - 85, finalY + 10);

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(data.amountCents), pageWidth - 25, finalY + 18, { align: 'right' });

    // Payment Status "Stamp"
    doc.setDrawColor(...successColor);
    doc.setLineWidth(1);
    doc.rect(20, finalY, 50, 20);
    doc.setTextColor(...successColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGADO', 45, finalY + 13, { align: 'center' });

    doc.setFontSize(8);
    const paidDate = data.paidAt ? new Date(data.paidAt).toLocaleDateString('es-ES') : 'Confirmado';
    doc.text(`Fecha: ${paidDate}`, 45, finalY + 18, { align: 'center' });

    // 5. Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('¡Gracias por su confianza!', pageWidth / 2, 270, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Este es un documento oficial generado por Rent Manager.', pageWidth / 2, 275, { align: 'center' });

    // Save
    doc.save(`recibo_${data.tenantName.replace(/\s+/g, '_').toLowerCase()}_${data.id.substring(0, 8)}.pdf`);
}
