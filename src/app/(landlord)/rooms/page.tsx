import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createRoom, deleteRoom } from '@/actions/rooms';
import { db } from '@/lib/db';
import { requireManagementAccess } from '@/lib/rbac';
import { Badge, Button, Card, Input } from '@/components/ui/shared';
import { Trash2 } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function RoomsPage() {
    const user = await requireManagementAccess();
    const isLandlord = user.role === Role.LANDLORD;

    const rawRooms = await db.room.findMany();
    const rooms = rawRooms.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Propiedades</h1>
                <p className="text-muted-foreground">
                    {isLandlord ? "Gestiona tus habitaciones y pisos." : "Listado de propiedades (Solo Lectura)."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* List */}
                <div className="space-y-4">
                    {rooms.map((room) => (
                        <Card key={room.id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{room.name}</h3>
                                    <Badge variant={room.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                                        {room.status === 'AVAILABLE' ? 'DISPONIBLE' : 'OCUPADA'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{room.notes}</p>
                            </div>
                            {isLandlord && (
                                <ConfirmDialog
                                    trigger={
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 size={18} />
                                        </Button>
                                    }
                                    title="Eliminar Habitación"
                                    description={`¿Estás seguro de eliminar ${room.name}?`}
                                    onConfirm={async () => {
                                        'use server';
                                        await deleteRoom(room.id);
                                    }}
                                />
                            )}
                        </Card>
                    ))}
                    {rooms.length === 0 && <p className="text-muted-foreground italic">No hay propiedades registradas.</p>}
                </div>

                {/* Create Form - Landlord Only */}
                {isLandlord && (
                    <Card className="p-6 h-fit sticky top-8">
                        <h3 className="text-xl font-semibold mb-4">Nueva Habitación</h3>
                        <form action={createRoom} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nombre / Identificador</label>
                                <Input name="name" placeholder="Ej. Habitación 101" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notas</label>
                                <Input name="notes" placeholder="Ej. Exterior, Cama doble..." />
                            </div>
                            <Button type="submit" className="w-full">Crear Propiedad</Button>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
