import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Button, Card, Input } from '@/components/ui/shared';
import { updateTenant } from '@/actions/tenants';
import { redirect } from 'next/navigation';

export default async function EditTenantPage(props: { params: Promise<{ id: string }> }) {
    await requireLandlord();
    const params = await props.params;
    const { id } = params;

    const tenant = await db.tenantProfile.findUnique({
        where: { id },
        include: { user: true }
    });

    if (!tenant) {
        redirect('/tenants');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Editar Inquilino</h1>
                <p className="text-muted-foreground">Modifica los datos de {tenant.fullName}.</p>
            </div>

            <Card className="p-6">
                <form action={async (formData) => {
                    'use server';
                    await updateTenant(formData);
                    redirect('/tenants');
                }} className="space-y-4">
                    <input type="hidden" name="id" value={tenant.id} />

                    <div>
                        <label className="text-sm font-medium">Nombre Completo</label>
                        <Input name="fullName" defaultValue={tenant.fullName} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Email (Login)</label>
                        <Input name="email" type="email" defaultValue={tenant.user.email} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Nº Documento (Opcional)</label>
                        <Input name="documentNumber" defaultValue={tenant.documentNumber || ''} placeholder="DNI / NIE / Pasaporte" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Teléfono (E.164)</label>
                        <Input name="phone" defaultValue={tenant.phoneE164} required />
                        <p className="text-xs text-muted-foreground mt-1">Formato internacional requerido para WhatsApp.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="whatsappOptIn"
                            id="wa"
                            className="rounded border-gray-300"
                            defaultChecked={tenant.whatsappOptIn}
                        />
                        <label htmlFor="wa" className="text-sm">Activar notificaciones WhatsApp</label>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Notas</label>
                        <Input name="notes" defaultValue={tenant.notes || ''} placeholder="Comentarios..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="w-full" asChild>
                            <a href="/tenants">Cancelar</a>
                        </Button>
                        <Button type="submit" className="w-full">Guardar Cambios</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
