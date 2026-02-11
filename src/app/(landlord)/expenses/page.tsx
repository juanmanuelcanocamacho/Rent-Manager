import { db } from '@/lib/db';
import { requireManagementAccess, getSessionUser, getLandlordContext } from '@/lib/rbac';
import { Button, Card, Input, Badge } from '@/components/ui/shared';
import { createExpense, deleteExpense, approveExpense, rejectExpense } from '@/actions/expenses';
import { formatMoney } from '@/lib/money';
import { Trash2, TrendingDown, Calendar, Tag, Check, X, Clock } from 'lucide-react';
import { ExpenseCategory, Role, ExpenseStatus } from '@prisma/client';

export default async function ExpensesPage() {
    const user = await requireManagementAccess();
    const isLandlord = user.role === Role.LANDLORD;
    const landlordId = await getLandlordContext();

    const expenses = await db.expense.findMany({
        where: { landlordId: landlordId },
        orderBy: { date: 'desc' },
        include: { room: true }
    });

    const pendingExpenses = expenses.filter(e => e.status === ExpenseStatus.PENDING);
    const approvedExpenses = expenses.filter(e => e.status === ExpenseStatus.APPROVED);

    // Calculate total only for APPROVED expenses
    const totalExpenses = approvedExpenses.reduce((acc, curr) => acc + curr.amountCents, 0);

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gastos y Mantenimiento</h1>
                    <p className="text-muted-foreground">
                        {isLandlord
                            ? "Gestiona y aprueba los gastos de las propiedades."
                            : "Registra los gastos para aprobación del casero."}
                    </p>
                </div>
                <Card className="p-4 flex items-center gap-4 bg-red-50 border-red-100 dark:bg-red-900/10">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Total Aprobado</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatMoney(totalExpenses)}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* List Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Pending Approvals Section */}
                    {(pendingExpenses.length > 0) && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-amber-600">
                                <Clock size={20} />
                                Pendientes de Aprobación
                            </h2>
                            {pendingExpenses.map((expense) => (
                                <Card key={expense.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-600">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{expense.description}</h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> {expense.date.toLocaleDateString()}
                                                </span>
                                                <span className="font-bold text-red-600">
                                                    {formatMoney(expense.amountCents)}
                                                </span>
                                                <Badge variant="warning" className="text-[10px]">PENDIENTE</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isLandlord ? (
                                            <>
                                                <form action={async () => {
                                                    'use server';
                                                    await approveExpense(expense.id);
                                                }}>
                                                    <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                                                        <Check size={16} className="mr-1" /> Aprobar
                                                    </Button>
                                                </form>
                                                <form action={async () => {
                                                    'use server';
                                                    await rejectExpense(expense.id); // Or delete
                                                }}>
                                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                        <X size={16} className="mr-1" /> Rechazar
                                                    </Button>
                                                </form>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Esperando revisión...</span>
                                        )}
                                        {/* Both can delete pending if they want to cancel? Let's allow delete for creator (implied manager) */}
                                        <form action={async () => {
                                            'use server';
                                            await deleteExpense(expense.id);
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 size={16} />
                                            </Button>
                                        </form>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Approved History */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Historial Aprobado</h2>
                        {approvedExpenses.length === 0 ? (
                            <p className="text-muted-foreground italic">No hay gastos aprobados.</p>
                        ) : (
                            approvedExpenses.map((expense) => (
                                <Card key={expense.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{expense.description}</h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> {expense.date.toLocaleDateString()}
                                                </span>
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                                                    {formatCategory(expense.category)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-red-600">-{formatMoney(expense.amountCents)}</span>

                                        {/* Only Landlord can delete approved expenses */}
                                        {isLandlord && (
                                            <form action={async () => {
                                                'use server';
                                                await deleteExpense(expense.id);
                                            }}>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Form */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Registrar Gasto</h2>
                    <Card className="p-6 sticky top-8">
                        <form action={createExpense} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Concepto</label>
                                <Input name="description" placeholder="Ej: Reparación cisterna" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Monto (€)</label>
                                    <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Fecha</label>
                                    <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Categoría</label>
                                <select
                                    name="category"
                                    className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="MAINTENANCE">Mantenimiento</option>
                                    <option value="UTILITIES">Suministros (Luz/Agua)</option>
                                    <option value="INSURANCE">Seguros</option>
                                    <option value="TAXES">Impuestos / Tasas</option>
                                    <option value="OTHER">Otros</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                {isLandlord ? 'Guardar Gasto' : 'Enviar para Aprobación'}
                            </Button>
                            {!isLandlord && (
                                <p className="text-xs text-center text-muted-foreground">
                                    El gasto quedará pendiente hasta que el casero lo apruebe.
                                </p>
                            )}
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function formatCategory(cat: ExpenseCategory) {
    const map: Record<ExpenseCategory, string> = {
        MAINTENANCE: 'Mantenimiento',
        UTILITIES: 'Suministros',
        INSURANCE: 'Seguros',
        TAXES: 'Impuestos',
        OTHER: 'Otros'
    };
    return map[cat] || cat;
}
