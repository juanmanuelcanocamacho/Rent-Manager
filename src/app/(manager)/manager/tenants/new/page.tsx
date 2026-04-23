import { createTenant } from '@/actions/tenants';
import { requireManagementAccess } from '@/lib/rbac';
import { Button, Card, Input } from '@/components/ui/shared';
import { PhoneInput } from '@/components/ui/phone-input';
import { UserPlus } from 'lucide-react';


export default async function ManagerNewTenantPage() {
    await requireManagementAccess();

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Nuevo Inquilino</h1>
                <p className="text-muted-foreground mt-1">Registra los datos básicos del nuevo residente.</p>
            </div>

            <Card className="p-6 md:p-8 shadow-xl border-t-4 border-t-emerald-500 rounded-3xl">
                <form action={createTenant} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Nombre Completo</label>
                        <Input name="fullName" placeholder="Ej: Juan Pérez" required className="h-12 text-lg rounded-xl" />
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Email de Acceso (Opcional)</label>
                        <Input name="email" type="email" placeholder="usuario@ejemplo.com" className="h-12 text-lg rounded-xl" />
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                            Si se deja vacío, se generará uno automático.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Nº Documento / DNI</label>
                        <Input name="documentNumber" placeholder="DNI / NIE / Pasaporte" className="h-12 text-lg rounded-xl" />
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Teléfono (WhatsApp)</label>
                        <PhoneInput name="phone" />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed">
                        <input type="checkbox" name="whatsappOptIn" id="wa" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="wa" className="text-sm font-medium leading-none">
                            Activar notificaciones WhatsApp
                        </label>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                             <UserPlus size={20} className="mr-2" /> Crear Inquilino
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
