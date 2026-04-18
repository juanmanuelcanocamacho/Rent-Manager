import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { createExpense } from '@/actions/expenses';
import { Button, Card, Input } from '@/components/ui/shared';
import { ExpenseCategory } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function ManagerNewExpensePage() {
    const user = await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const rooms = (await db.room.findMany({
        where: { landlordId: landlordId },
    })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Reportar Gasto</h1>
                <p className="text-muted-foreground mt-1">
                    Registra un gasto operativo. El propietario recibirá una solicitud para su aprobación.
                </p>
            </div>

            <Card className="p-6 md:p-8 shadow-xl border-t-4 border-t-primary rounded-3xl">
                <form action={async (formData) => {
                    'use server';
                    await createExpense(formData);
                    redirect('/manager/dashboard');
                }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="md:col-span-2">
                        <label className="text-sm font-bold block mb-2 px-1">Concepto / Descripción</label>
                        <Input 
                            name="description" 
                            placeholder="Ej: Bombilla pasillo, Reparación grifo..." 
                            required 
                            className="h-12 text-lg rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Monto (Bs)</label>
                        <Input 
                            name="amount" 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            required 
                            className="h-12 text-lg rounded-xl px-4"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Fecha</label>
                        <Input 
                            name="date" 
                            type="date" 
                            defaultValue={new Date().toISOString().split('T')[0]} 
                            required 
                            className="h-12 text-lg rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Categoría</label>
                        <select
                            name="category"
                            required
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-lg ring-offset-background focus:ring-2 focus:ring-primary outline-none transition-all"
                        >
                            <option value={ExpenseCategory.MAINTENANCE}>Mantenimiento</option>
                            <option value={ExpenseCategory.UTILITIES}>Suministros (Agua/Luz)</option>
                            <option value={ExpenseCategory.OTHER}>Otros</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Propiedad / Hab. (Opcional)</label>
                        <select
                            name="roomId"
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-lg ring-offset-background focus:ring-2 focus:ring-primary outline-none transition-all"
                        >
                            <option value="">Gesto General</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 pt-6 flex flex-col gap-3">
                        <Button type="submit" className="h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                            Enviar Solicitud
                        </Button>
                        <Button variant="ghost" asChild className="h-12 text-muted-foreground">
                            <a href="/manager/dashboard">Cancelar</a>
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
