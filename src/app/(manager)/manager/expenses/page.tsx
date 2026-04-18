import { db } from '@/lib/db';
import { requireManagementAccess, getLandlordContext } from '@/lib/rbac';
import { Card, Badge, Button } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { TrendingDown, Calendar, Tag, Clock, Plus } from 'lucide-react';
import { ExpenseStatus, Role } from '@prisma/client';
import Link from 'next/link';

export default async function ManagerExpensesPage() {
    await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const expenses = await db.expense.findMany({
        where: { landlordId: landlordId },
        orderBy: { date: 'desc' },
        include: { room: true },
        take: 50
    });

    const pendingExpenses = expenses.filter(e => e.status === ExpenseStatus.PENDING);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 px-1">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Gastos</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Seguimiento de gastos reportados.
                    </p>
                </div>
                <Button asChild className="rounded-2xl shadow-lg">
                    <Link href="/manager/expenses/new">
                        <Plus size={20} className="mr-2" /> Reportar
                    </Link>
                </Button>
            </div>

            {pendingExpenses.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600">
                        <Clock size={20} /> Pendientes de Aprobación
                    </h2>
                    {pendingExpenses.map((expense) => (
                        <Card key={expense.id} className="p-4 border-amber-200 bg-amber-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">{expense.description}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <Calendar size={12} /> {expense.date.toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="font-bold text-rose-600">
                                    {formatMoney(expense.amountCents)}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                {expenses.filter(e => e.status !== ExpenseStatus.PENDING).map((expense) => (
                    <Card key={expense.id} className={`p-4 flex justify-between items-center ${expense.status === 'REJECTED' ? 'opacity-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h3 className="text-sm font-semibold truncate">{expense.description}</h3>
                                {expense.status === 'APPROVED' ? (
                                    <Badge variant="success" className="text-[10px] shrink-0">Aprobado</Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-[10px] shrink-0">Rechazado</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar size={11} /> {expense.date.toLocaleDateString('es-ES')}
                                {expense.room && <span>· {expense.room.name}</span>}
                            </p>
                        </div>
                        <span className={`font-bold text-sm shrink-0 ml-4 ${expense.status === 'APPROVED' ? 'text-rose-600' : 'text-muted-foreground line-through'}`}>
                            {formatMoney(expense.amountCents)}
                        </span>
                    </Card>
                ))}
                {expenses.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground italic">No hay gastos registrados.</p>
                )}
            </div>
        </div>
    );
}
