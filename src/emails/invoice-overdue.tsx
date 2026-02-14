import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface InvoiceOverdueEmailProps {
    tenantName: string;
    amountCents: number;
    dueDate: string;
    daysOverdue: number;
    invoiceUrl?: string;
}

export const InvoiceOverdueEmail = ({
    tenantName,
    amountCents,
    dueDate,
    daysOverdue,
    invoiceUrl,
}: InvoiceOverdueEmailProps) => {
    const amount = (amountCents / 100).toFixed(2);

    return (
        <Html>
            <Head />
            <Preview>Tu factura de alquiler está vencida - Acción requerida</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>⚠️ Factura Vencida</Heading>
                    <Text style={text}>Hola {tenantName},</Text>
                    <Text style={text}>
                        Tu factura de alquiler está <strong style={{ color: '#dc2626' }}>vencida desde hace {daysOverdue} días</strong>.
                    </Text>
                    <Section style={invoiceBox}>
                        <Text style={invoiceAmount}>€{amount}</Text>
                        <Text style={invoiceDate}>Venció el: {dueDate}</Text>
                    </Section>
                    <Text style={text}>
                        Por favor, realiza el pago lo antes posible para evitar cargos adicionales o acciones legales.
                    </Text>
                    {invoiceUrl && (
                        <Section style={buttonContainer}>
                            <Button style={button} href={invoiceUrl}>
                                Pagar Ahora
                            </Button>
                        </Section>
                    )}
                    <Text style={footer}>
                        Si ya has realizado el pago, por favor ignora este mensaje.
                        <br /><br />
                        Equipo de Rent Manager
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default InvoiceOverdueEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const h1 = {
    color: '#dc2626',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0 40px',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
};

const invoiceBox = {
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    margin: '24px 40px',
    padding: '24px',
    textAlign: 'center' as const,
    border: '2px solid #fecaca',
};

const invoiceAmount = {
    color: '#dc2626',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
};

const invoiceDate = {
    color: '#666',
    fontSize: '14px',
    margin: '0',
};

const buttonContainer = {
    padding: '0 40px',
    marginTop: '24px',
};

const button = {
    backgroundColor: '#dc2626',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 20px',
};

const footer = {
    color: '#8898aa',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '0 40px',
    marginTop: '32px',
};
