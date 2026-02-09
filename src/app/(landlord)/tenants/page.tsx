import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createTenant, deleteTenant } from '@/actions/tenants';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Badge, Button, Card, Input } from '@/components/ui/shared';
import { PhoneInput } from '@/components/ui/phone-input';
import { User, Phone, Trash2, Pencil } from 'lucide-react';

export default async function TenantsPage() {
    await requireLandlord();
    const tenants = await db.tenantProfile.findMany({
        include: { user: true },
        orderBy: { fullName: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Inquilinos</h1>
                <p className="text-muted-foreground">Gestiona los usuarios y perfiles de inquilinos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {tenants.map((tenant) => (
                        <Card key={tenant.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full h-fit">
                                        <User className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{tenant.fullName}</h3>
                                        <p className="text-sm text-muted-foreground">{tenant.user.email}</p>
                                        {tenant.documentNumber && <p className="text-xs text-muted-foreground font-mono">Doc: {tenant.documentNumber}</p>}
                                        {tenant.generatedPassword && (
                                            <p className="text-xs text-green-600 mt-1 font-mono bg-green-50 px-2 py-0.5 rounded w-fit">
                                                Clave: {tenant.generatedPassword}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 text-sm">
                                            <Phone size={14} /> {tenant.phoneE164}
                                            {tenant.whatsappOptIn && <Badge variant="success" className="ml-2">WhatsApp On</Badge>}
                                        </div>
                                        {tenant.notes && <p className="text-xs mt-2 bg-muted p-2 rounded">{tenant.notes}</p>}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" asChild className="p-2 h-auto text-muted-foreground hover:text-primary">
                                        <a href={`/tenants/${tenant.id}`}>
                                            <Pencil size={18} />
                                        </a>
                                    </Button>
                                    <ConfirmDialog
                                        trigger={
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive p-2 h-auto">
                                                <Trash2 size={18} />
                                            </Button>
                                        }
                                        title="Eliminar Inquilino"
                                        description={`¿Estás seguro de eliminar a ${tenant.fullName}? Se borrarán contratos y facturas asociados.`}
                                        onConfirm={async () => {
                                            'use server';
                                            await deleteTenant(tenant.id);
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                    {tenants.length === 0 && <p className="text-muted-foreground italic">No hay inquilinos registrados.</p>}
                </div>

                {/* Create Form */}
                <Card className="p-6 h-fit sticky top-8">
                    <h3 className="text-xl font-semibold mb-4">Nuevo Inquilino</h3>
                    <form action={createTenant} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nombre Completo</label>
                            <Input name="fullName" placeholder="Juan Pérez" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email (Login)</label>
                            <Input name="email" type="email" placeholder="usuario@alquiler.com" />
                            <p className="text-xs text-muted-foreground mt-1">Opcional. Si se deja vacío, se generará: nombre@alquiler.com</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nº Documento (Opcional)</label>
                            <Input name="documentNumber" placeholder="DNI / NIE / Pasaporte" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Teléfono (WhatsApp)</label>
                            <PhoneInput name="phone" />
                            <p className="text-xs text-muted-foreground mt-1">Selecciona el país y escribe el número.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="whatsappOptIn" id="wa" className="rounded border-gray-300" />
                            <label htmlFor="wa" className="text-sm">Activar notificaciones WhatsApp</label>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Notas</label>
                            <Input name="notes" placeholder="Comentarios..." />
                        </div>
                        <Button type="submit" className="w-full">Crear Inquilino</Button>
                        <p className="text-xs text-center text-muted-foreground bg-muted p-2 rounded">
                            La contraseña temporal se mostrará en los logs del servidor (MVP).
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
