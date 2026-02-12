'use client';

import { Card } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

interface FinancialHeaderProps {
    totalDebtCents: number;
    overdueCount: number;
    upToDateCount: number;
    upcomingCents: number;
}

export function FinancialHeader({ totalDebtCents, overdueCount, upToDateCount, upcomingCents }: FinancialHeaderProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card className="p-3 md:p-4 bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Deuda Total</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{formatMoney(totalDebtCents)}</h3>
                    </div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
                        <TrendingUp size={18} className="md:w-5 md:h-5" />
                    </div>
                </div>
            </Card>

            <Card className="p-3 md:p-4 bg-white dark:bg-slate-900 border-l-4 border-l-rose-500 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Facturas Vencidas</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{overdueCount}</h3>
                            <span className="text-[10px] md:text-xs text-rose-600 font-medium">requieren acción</span>
                        </div>
                    </div>
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg">
                        <AlertCircle size={18} className="md:w-5 md:h-5" />
                    </div>
                </div>
            </Card>

            <Card className="p-3 md:p-4 bg-white dark:bg-slate-900 border-l-4 border-l-emerald-500 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Inquilinos al Día</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{upToDateCount}</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                        <CheckCircle size={18} className="md:w-5 md:h-5" />
                    </div>
                </div>
            </Card>

            <Card className="p-3 md:p-4 bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximos 30 días</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{formatMoney(upcomingCents)}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Calendar size={18} className="md:w-5 md:h-5" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
