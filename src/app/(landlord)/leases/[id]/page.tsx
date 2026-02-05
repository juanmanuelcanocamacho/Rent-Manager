import { updateLease } from '@/actions/leases';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Button, Card, Input } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function EditLeasePage({ params }: { params: Promise<{ id: string }> }) {
    await requireLandlord();
    const { id } = await params;

    const lease = await db.lease.findUnique({
        where: { id },
        include: { tenant: true, rooms: true }
    });

    if (!lease) notFound();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Button variant="ghost" size="sm" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <a href="/leases" className="flex items-center gap-2">
                        <ArrowLeft size={16} /> Volver a Contratos
                    </a>
                </Button>
                <h1 className="text-3xl font-bold">Editar Contrato</h1>
                <p className="text-muted-foreground">
                    {lease.tenant.fullName} — {lease.rooms.map(r => r.name).join(', ')}
                </p>
            </div>

            <Card className="p-6">
                <form action={updateLease} className="space-y-6">
                    <input type="hidden" name="id" value={lease.id} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Fecha de Inicio (Info)</label>
                            <Input
                                disabled
                                value={lease.startDate.toISOString().split('T')[0]}
                                className="bg-muted"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Fecha de Fin (Renovación)</label>
                            <Input
                                name="endDate"
                                type="date"
                                defaultValue={lease.endDate ? lease.endDate.toISOString().split('T')[0] : ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Dejar vacío para indefinido (si aplica) o seleccionar nueva fecha.</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Día de Cobro</label>
                            <Input
                                name="billingDay"
                                type="number"
                                min="1"
                                max="31"
                                defaultValue={lease.billingDay}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Renta Mensual (Bs)</label>
                            <Input
                                name="rentAmountCents"
                                type="number"
                                step="0.01"
                                defaultValue={(lease.rentAmountCents / 100).toFixed(2)}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium mb-2 block">Estado</label>
                            <select
                                name="status"
                                defaultValue={lease.status}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="ACTIVE">ACTIVO</option>
                                <option value="ENDED">FINALIZADO</option>
                            </select>
                        </div>

                        {/* Notes field omitted as it requires schema migration. Can be added later. */}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button variant="outline" asChild>
                            <a href="/leases">Cancelar</a>
                        </Button>
                        <Button type="submit">Guardar Cambios</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
