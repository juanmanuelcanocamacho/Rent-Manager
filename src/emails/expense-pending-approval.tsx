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

interface ExpensePendingApprovalEmailProps {
    landlordName: string;
    description: string;
    amountCents: number;
    category: string;
    propertyName?: string;
    expenseUrl?: string;
}

export const ExpensePendingApprovalEmail = ({
    landlordName,
    description,
    amountCents,
    category,
    propertyName,
    expenseUrl,
}: ExpensePendingApprovalEmailProps) => {
    const amount = (amountCents / 100).toFixed(2);

    return (
        <Html>
            <Head />
            <Preview>Nuevo gasto pendiente de aprobación</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>💰 Gasto Pendiente de Aprobación</Heading>
                    <Text style={text}>Hola {landlordName},</Text>
                    <Text style={text}>
                        Tienes un nuevo gasto registrado que requiere tu aprobación.
                    </Text>
                    <Section style={expenseBox}>
                        <Text style={expenseAmount}>€{amount}</Text>
                        <Text style={expenseCategory}>{category}</Text>
                        {propertyName && <Text style={expenseProperty}>Propiedad: {propertyName}</Text>}
                        <Text style={expenseDescription}>{description}</Text>
                    </Section>
                    {expenseUrl && (
                        <Section style={buttonContainer}>
                            <Button style={button} href={expenseUrl}>
                                Revisar y Aprobar
                            </Button>
                        </Section>
                    )}
                    <Text style={footer}>
                        Equipo de Rent Manager
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ExpensePendingApprovalEmail;

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
    color: '#333',
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

const expenseBox = {
    backgroundColor: '#fff7ed',
    borderRadius: '8px',
    margin: '24px 40px',
    padding: '24px',
    textAlign: 'center' as const,
    border: '1px solid #fed7aa',
};

const expenseAmount = {
    color: '#ea580c',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
};

const expenseCategory = {
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 4px 0',
};

const expenseProperty = {
    color: '#666',
    fontSize: '14px',
    margin: '0 0 12px 0',
};

const expenseDescription = {
    color: '#333',
    fontSize: '16px',
    margin: '12px 0 0 0',
    fontStyle: 'italic',
};

const buttonContainer = {
    padding: '0 40px',
    marginTop: '24px',
};

const button = {
    backgroundColor: '#ea580c',
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
