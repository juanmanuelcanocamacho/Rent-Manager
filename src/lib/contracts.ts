import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContractData {
    date: Date;
    landlord: {
        name: string;
        documentNumber: string;
        documentIssuedIn: string;
        maritalStatus: string;
        legalAddress: string;
    };
    tenant: {
        name: string;
        documentNumber: string;
        documentIssuedIn: string;
        maritalStatus: string;
        currentAddress: string;
        phone: string;
        email: string;
    };
    room: {
        id: string;
        address: string;
        zone: string;
        sizeM2: number;
        features: string;
        commonAreas: string;
    };
    lease: {
        rentAmount: string;
        billingDay: number;
        currency: string;
    };
}

export function generateBolivianContract(data: ContractData): string {
    const day = format(data.date, 'd');
    const month = format(data.date, 'MMMM', { locale: es });
    const year = format(data.date, 'yyyy');

    return `
CONTRATO DE ARRENDAMIENTO DE HABITACIÓN
Santa Cruz de la Sierra, Bolivia

COMPARECIENTES
En la ciudad de Santa Cruz de la Sierra, a los ${day} días del mes de ${month} del año ${year}, suscriben el presente contrato:

ARRENDADOR (Propietario): ${data.landlord.name.toUpperCase()}, mayor de edad, ${data.landlord.maritalStatus.toLowerCase()}, con Cédula de Identidad N° ${data.landlord.documentNumber}, expedida en ${data.landlord.documentIssuedIn}, con domicilio en ${data.landlord.legalAddress}, en su calidad de propietario del bien inmueble donde se ubica la habitación objeto del presente contrato.

ARRENDATARIO (Inquilino): ${data.tenant.name.toUpperCase()}, mayor de edad, ${data.tenant.maritalStatus.toLowerCase()}, con Cédula de Identidad N° ${data.tenant.documentNumber}, expedida en ${data.tenant.documentIssuedIn}, con domicilio actual en ${data.tenant.currentAddress}, con número de teléfono ${data.tenant.phone} y correo electrónico ${data.tenant.email}.

Ambas partes, de mutuo acuerdo y en pleno ejercicio de su capacidad legal, celebran el presente CONTRATO DE ARRENDAMIENTO DE HABITACIÓN, al amparo de la Ley del Inquilinato de 1959, el Código Civil Boliviano (Arts. 685-722) y el Código Procesal Civil (2013), sujeto a las siguientes cláusulas:

CLÁUSULA PRIMERA: OBJETO DEL CONTRATO
El ARRENDADOR da en alquiler al ARRENDATARIO, y este acepta en arrendamiento, la habitación N° ${data.room.id}, ubicada en ${data.room.address}, Zona ${data.room.zone}, Santa Cruz de la Sierra, Bolivia. La habitación tiene una superficie aproximada de ${data.room.sizeM2} metros cuadrados y cuenta con: ${data.room.features}.
El inmueble donde se ubica la habitación se destina exclusiva y únicamente para USO HABITACIONAL (vivienda personal del arrendatario). Queda expresamente prohibido su uso para actividades comerciales, industriales, profesionales, de almacenamiento u otro fin distinto al señalado.

CLÁUSULA SEGUNDA: CANON DE ARRENDAMIENTO Y FORMA DE PAGO
El canon de arrendamiento mensual se fija en la suma de ${data.lease.rentAmount} ${data.lease.currency}. 
De mutuo acuerdo, las partes establecen que el pago se realizará bajo la modalidad de **MES CUMPLIDO**. Es decir, el ARRENDATARIO cancelará el monto estipulado una vez finalizado el mes de uso, debiendo realizar el pago el día ${data.lease.billingDay} de cada mes vencido.

CLÁUSULA TERCERA: SERVICIOS INCLUIDOS Y ÁREAS COMUNES
El arrendamiento de la habitación incluye el acceso y uso compartido de las siguientes áreas comunes: ${data.room.commonAreas}.
Los servicios básicos incluidos en el canon son: energía eléctrica, agua potable e internet. El ARRENDATARIO se compromete a hacer uso racional y responsable de los servicios compartidos, evitando desperdicio y excesos que perjudiquen a los demás ocupantes del inmueble.

(Siguen firmas...)
    `.trim();
}
