import { db } from '@/lib/db';
import { requireLandlord, getLandlordContext } from '@/lib/rbac';
import { Button, Card, Input, Badge } from '@/components/ui/shared';
import { createManager, deleteManager } from '@/actions/team';
import { UserCog, Trash2, Shield } from 'lucide-react';
import { Role } from '@prisma/client';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default async function TeamPage() {
    await requireLandlord();
    const landlordId = await getLandlordContext();

    const managers = await db.user.findMany({
        where: { role: Role.MANAGER, landlordId: landlordId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            <div>
                <h1 className="text-3xl font-bold">Equipo de Gestión</h1>
                <p className="text-muted-foreground">Administra los encargados con acceso al panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold">Encargados Activos</h2>
                    {managers.length === 0 ? (
                        <p className="text-muted-foreground italic bg-muted/20 p-8 rounded text-center">
                            No hay encargados registrados. Añade uno desde el formulario.
                        </p>
                    ) : (
                        managers.map((manager) => (
                            <Card key={manager.id} className="p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                                        <UserCog size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{manager.email}</p>
                                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                            <Badge variant="secondary" className="text-[10px]">MANAGER</Badge>
                                            <span>Creado el {manager.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <ConfirmDialog
                                    trigger={
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 size={18} />
                                        </Button>
                                    }
                                    title="Eliminar Encargado"
                                    description={`¿Seguro que quieres eliminar el acceso de ${manager.email}?`}
                                    onConfirm={async () => {
                                        'use server';
                                        await deleteManager(manager.id);
                                    }}
                                />
                            </Card>
                        ))
                    )}
                </div>

                {/* Create Form */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Nuevo Encargado</h2>
                    <Card className="p-6 sticky top-8 border-primary/20 shadow-lg shadow-primary/5">
                        <div className="mb-6 flex items-center gap-2 text-primary">
                            <Shield size={20} />
                            <h3 className="font-medium">Crear Acceso</h3>
                        </div>

                        <form action={createManager} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Email (Login)</label>
                                <Input name="email" type="email" placeholder="encargado@ejemplo.com" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Contraseña Inicial</label>
                                <Input name="password" type="text" placeholder="Clave segura" required minLength={6} />
                                <p className="text-xs text-muted-foreground mt-1">El encargado usará esto para entrar.</p>
                            </div>

                            {/* Full Name is not in User model currently, just Email/Password/Role. 
                                Wait, createManager action expects fullName?
                                Let's check schema/action. Action asks for fullName but schema User model (viewed previously) 
                                only has email, password, role. 
                                Ah, TenantProfile has fullName. User doesn't.
                                I'll remove fullName from action or add it to schema?
                                Schema is lean. Let's just use email for now or add name to User?
                                User model: id, email, passwordHash, role, createdAt, updatedAt.
                                No name column on User. 
                                I will update action to NOT use name, or assume User model update.
                                Let's keep it simple: just Email + Password.
                            */}

                            <Button type="submit" className="w-full">
                                Crear Encargado
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
