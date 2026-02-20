'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/shared';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/money';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ExpenseBreakdownChartProps {
    data: any[];
    country: string;
}

export function ExpenseBreakdownChart({ data, country }: ExpenseBreakdownChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Card className="p-6 h-[400px] flex items-center justify-center animate-pulse"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></Card>;
    }

    if (!data || data.length === 0) {
        return (
            <Card className="p-6 h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-70">
                <PieChartIcon size={48} className="text-slate-300 mb-4" />
                <h3 className="font-medium text-slate-800 dark:text-slate-200">Sin datos de gastos</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">Aún no has registrado gastos este mes para analizar su distribución.</p>
            </Card>
        );
    }

    const formatCurrency = (value: number) => {
        return formatMoney(value * 100, country);
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium text-sm mb-1">{payload[0].name}</p>
                    <p className="text-sm font-semibold text-rose-500">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-4 md:p-6 w-full h-full min-h-[400px] flex flex-col">
            <div className="mb-2">
                <h3 className="text-lg font-semibold">Desglose de Gastos</h3>
                <p className="text-sm text-muted-foreground">Distribución por categoría (Mes Actual)</p>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry: any) => (
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
