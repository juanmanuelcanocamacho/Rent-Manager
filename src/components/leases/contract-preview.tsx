'use client';

import { Card, Button } from '@/components/ui/shared';
import { generateBolivianContract } from '@/lib/contracts';
import { Download, FileText, Send, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import Link from 'next/link';

interface ContractPreviewProps {
    lease: any;
    landlord: any;
}

export function ContractPreview({ lease, landlord }: ContractPreviewProps) {
    // Check for missing data
    const missingLandlordData = !landlord.documentNumber || !landlord.legalAddress || !landlord.maritalStatus;
    const missingTenantData = !lease.tenant.documentNumber || !lease.tenant.currentAddress || !lease.tenant.maritalStatus;
    const missingRoomData = lease.rooms.some((r: any) => !r.sizeM2);

    const contractData = {
        date: new Date(),
        landlord: {
            name: landlord.name || '',
            documentNumber: landlord.documentNumber || '[FALTA CI]',
            documentIssuedIn: landlord.documentIssuedIn || '[FALTA EXPEDICIÓN]',
            maritalStatus: landlord.maritalStatus || '[FALTA ESTADO CIVIL]',
            legalAddress: landlord.legalAddress || '[FALTA DIRECCIÓN]',
        },
        tenant: {
            name: lease.tenant.fullName || '',
            documentNumber: lease.tenant.documentNumber || '[FALTA CI]',
            documentIssuedIn: lease.tenant.documentIssuedIn || '[FALTA EXPEDICIÓN]',
            maritalStatus: lease.tenant.maritalStatus || '[FALTA ESTADO CIVIL]',
            currentAddress: lease.tenant.currentAddress || '[FALTA DIRECCIÓN]',
            phone: lease.tenant.phoneE164 || '',
            email: lease.tenant.user.email || '',
        },
        room: {
            id: lease.rooms.map((r: any) => r.name).join(', '),
            address: landlord.legalAddress || '', 
            zone: 'Central', 
            sizeM2: lease.rooms[0]?.sizeM2 || 0,
            features: lease.rooms[0]?.features || 'Servicios básicos compartidos',
            commonAreas: 'baño, cocina, lavandería',
        },
        lease: {
            rentAmount: (lease.rentAmountCents / 100).toFixed(2),
            billingDay: lease.billingDay,
            currency: 'Bs.',
        }
    };

    const contractText = generateBolivianContract(contractData);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(contractText, 180);
        doc.setFontSize(11);
        doc.text(splitText, 15, 20);
        doc.save(`Contrato_${lease.tenant.fullName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Previsualización de Contrato</h1>
                    <p className="text-muted-foreground font-medium">Revisa los datos antes de descargar o enviar</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleDownloadPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
                        <Download size={18} /> Descargar PDF
                    </Button>
                    <Button disabled className="flex-1 sm:flex-none flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <Send size={18} /> Enviar (Próximamente)
                    </Button>
                </div>
            </div>

            {(missingLandlordData || missingTenantData || missingRoomData) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 shadow-sm">
                    <AlertTriangle className="shrink-0 text-amber-600" size={20} />
                    <div className="text-sm">
                        <p className="font-bold">Faltan datos importantes para el contrato:</p>
                        <ul className="list-disc ml-4 mt-1 font-medium">
                            {missingLandlordData && <li>Tus datos legales en <Link href="/profile" className="underline font-black hover:text-amber-600">Mi Perfil</Link></li>}
                            {missingTenantData && <li>Datos legales del inquilino en <Link href="/tenants" className="underline font-black hover:text-amber-600">Inquilinos</Link></li>}
                            {missingRoomData && <li>Superficie (m²) de la habitación en <Link href="/rooms" className="underline font-black hover:text-amber-600">Propiedades</Link></li>}
                        </ul>
                    </div>
                </div>
            )}

            <Card className="p-8 md:p-12 shadow-2xl border-primary/10 bg-white">
                <div className="whitespace-pre-wrap font-serif text-sm md:text-base leading-relaxed text-zinc-800 bg-zinc-50/50 p-6 md:p-10 rounded-2xl border border-dashed border-zinc-200">
                    {contractText}
                </div>
            </Card>
        </div>
    );
}
