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

    // Color Palette based on Llavia brand (Indigo/Slate)
    const primaryColor: [number, number, number] = [99, 102, 241]; // Brand Indigo
    const slateDark: [number, number, number] = [30, 41, 59];      // Slate 800
    const slateMed: [number, number, number] = [100, 116, 139];    // Slate 500
    const slateLight: [number, number, number] = [248, 250, 252];  // Slate 50
    const successColor: [number, number, number] = [34, 197, 94];  // Emerald 500

    // 1. Header & Branding (Modern & Clean)
    // Small accent line at the top
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 2, 'F');

    // Logo Area
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
    const subtitle = 'Gestión Integral de Alquileres';
    doc.text(subtitle, 36, 29);

    // Document Type Label
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(pageWidth - 85, 18, 65, 10, 2, 2, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE PAGO', pageWidth - 52.5, 24.5, { align: 'center' });

    // 2. Info Grid
    let currentY = 55;

    // LEFT COLUMN: Tenant Info
    doc.setTextColor(...slateMed);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE / INQUILINO', 20, currentY);
    
    doc.setTextColor(...slateDark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.tenantName.toUpperCase(), 20, currentY + 7);
    
    doc.setTextColor(...slateMed);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Propiedad: ${data.rooms.join(', ')}`, 20, currentY + 13);

    // RIGHT COLUMN: Ref & Date
    doc.setTextColor(...slateMed);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL DOCUMENTO', pageWidth - 80, currentY);

    doc.setTextColor(...slateDark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCIA:', pageWidth - 80, currentY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(data.id.substring(0, 12).toUpperCase(), pageWidth - 45, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('EMITIDO EL:', pageWidth - 80, currentY + 13);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('es-ES'), pageWidth - 45, currentY + 13);

    // 3. Details Table
    const periodStr = (() => {
        const d = new Date(data.dueDate);
        d.setMonth(d.getMonth() - 1);
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    })().replace(/^\w/, (c) => c.toUpperCase());

    autoTable(doc, {
        startY: 85,
        head: [['CONCEPTO / DESCRIPCIÓN', 'VENCIMIENTO', 'TOTAL']],
        body: [
            [
                { 
                    content: `ALQUILER HABITACIÓN: ${data.rooms.join(', ')}\nPeriodo de mensualidad: ${periodStr}`, 
                    styles: { cellPadding: { top: 8, bottom: 8, left: 5, right: 5 } } 
                },
                new Date(data.dueDate).toLocaleDateString('es-ES'),
                formatMoney(data.amountCents)
            ]
        ],
        theme: 'plain',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: slateMed,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: { bottom: 5 }
        },
        bodyStyles: {
            textColor: slateDark,
            fontSize: 9,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { halign: 'center' },
            2: { halign: 'right', fontStyle: 'bold', textColor: primaryColor, fontSize: 11 }
        },
        didDrawPage: (data) => {
            // Header line for table
            const tableY = (data as any).settings.startY;
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(20, tableY + 7, pageWidth - 20, tableY + 7);
        }
    });

    // 4. Summaries and Status
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Payment Status "Badge"
    const badgeX = 20;
    const badgeWidth = 60;
    const badgeHeight = 25;
    
    doc.setFillColor(236, 253, 245); // Light Emerald
    doc.roundedRect(badgeX, finalY, badgeWidth, badgeHeight, 4, 4, 'F');
    
    // Draw Checkmark
    doc.setDrawColor(...successColor);
    doc.setLineWidth(1.5);
    doc.line(badgeX + 10, finalY + 13, badgeX + 13, finalY + 16);
    doc.line(badgeX + 13, finalY + 16, badgeX + 18, finalY + 9);

    doc.setTextColor(...successColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGADO', badgeX + 22, finalY + 13);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const paidDate = data.paidAt ? new Date(data.paidAt).toLocaleDateString('es-ES') : 'CONFIRMADO';
    doc.text(`Fecha: ${paidDate}`, badgeX + 22, finalY + 18);

    // Total Amount Box High Impact
    doc.setFillColor(...slateLight);
    doc.roundedRect(pageWidth - 90, finalY, 70, badgeHeight, 4, 4, 'F');

    doc.setTextColor(...slateMed);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL RECIBIDO', pageWidth - 82, finalY + 10);

    doc.setTextColor(...primaryColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(data.amountCents), pageWidth - 28, finalY + 19, { align: 'right' });

    // 5. Footer
    const footerY = 275;
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.5);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

    doc.setTextColor(...slateMed);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento digital sirve como comprobante oficial de pago.', 20, footerY);
    doc.text('Gracias por utilizar Llavia para la gestión de su alquiler.', 20, footerY + 4);

    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('llavia.com', pageWidth - 20, footerY + 2, { align: 'right' });

    // Save
    doc.save(`recibo_${data.tenantName.replace(/\s+/g, '_').toLowerCase()}_${data.id.substring(0, 8)}.pdf`);
}
