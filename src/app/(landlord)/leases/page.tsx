import { createLease, endLease, deleteLease } from '@/actions/leases';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { formatMoney } from '@/lib/money';
import { Badge, Button, Card, Input } from '@/components/ui/shared';
import { Trash2, Pencil } from 'lucide-react';
import { formatParamDate } from '@/lib/dates'; // helper to format date for display

export default async function LeasesPage() {
    await requireLandlord();

    const leases = await db.lease.findMany({
        include: { rooms: true, tenant: true, invoices: true },
        orderBy: { status: 'asc' } // Active first
    });

    const rooms = await db.room.findMany({ where: { status: 'AVAILABLE' } });
    rooms.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    const tenants = await db.tenantProfile.findMany({ include: { user: true } });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Contratos</h1>
                <p className="text-muted-foreground">Gestiona contratos de alquiler y generación de cuotas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {leases.map((lease) => (
                        <Card key={lease.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{lease.rooms.map(r => r.name).join(', ')}</h3>
                                        <Badge variant={lease.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                            {lease.status === 'ACTIVE' ? 'ACTIVO' : 'FINALIZADO'}
                                        </Badge>
                                        <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 hover:bg-muted ml-2">
                                            <a href={`/leases/${lease.id}`} title="Editar Contrato">
                                                <Pencil size={14} className="text-muted-foreground" />
                                            </a>
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground">{lease.tenant.fullName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-primary">{formatMoney(lease.rentAmountCents)}</p>
                                    <p className="text-xs text-muted-foreground">/ mes</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="text-muted-foreground">Inicio:</span> {lease.startDate.toLocaleDateString()}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Día cobro:</span> {lease.billingDay}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Cuotas:</span> {lease.invoices.length}
                                </div>
                            </div>

                            {lease.status === 'ACTIVE' && (
                                <div className="flex gap-2 mt-4">
                                    <form action={async () => {
                                        'use server';
                                        await endLease(lease.id);
                                    }}>
                                        <Button variant="secondary" size="sm" type="submit">Finalizar Contrato</Button>
                                    </form>

                                    <form action={async () => {
                                        'use server';
                                        await deleteLease(lease.id);
                                    }}>
                                        <Button variant="destructive" size="sm" type="submit" className="px-3">
                                            <Trash2 size={16} />
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {lease.status !== 'ACTIVE' && (
                                <div className="mt-4 flex justify-end">
                                    <form action={async () => {
                                        'use server';
                                        await deleteLease(lease.id);
                                    }}>
                                        <Button variant="ghost" size="sm" type="submit" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                            <Trash2 size={16} className="mr-2" /> Eliminar Historial
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </Card>
                    ))}
                    {leases.length === 0 && <p className="text-muted-foreground italic">No hay contratos.</p>}
                </div>

                {/* Create Form */}
                <Card className="p-6 h-fit sticky top-8">
                    <h3 className="text-xl font-semibold mb-4">Nuevo Contrato</h3>
                    <form action={createLease} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Habitaciones Disponibles</label>
                            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto bg-background">
                                {rooms.map(r => (
                                    <div key={r.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="roomIds"
                                            value={r.id}
                                            id={`room-${r.id}`}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`room-${r.id}`} className="text-sm cursor-pointer select-none">
                                            {r.name}
                                        </label>
                                    </div>
                                ))}
                                {rooms.length === 0 && <p className="text-xs text-muted-foreground">No hay habitaciones disponibles.</p>}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Inquilino</label>
                            <select name="tenantId" required className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                <option value="">Seleccionar...</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Fecha Inicio</label>
                            <Input name="startDate" type="date" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Duración (Meses)</label>
                            <Input name="duration" type="number" placeholder="12" min="1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Renta (Bs)</label>
                            <Input name="rentAmountCents" type="number" step="0.01" placeholder="350" required />
                        </div>
                        <Button type="submit" className="w-full">Crear y Generar Cuotas</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
