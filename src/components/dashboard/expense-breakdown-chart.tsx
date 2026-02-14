'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ExpenseBreakdownItem } from '@/lib/dashboard-analytics';

interface ExpenseBreakdownChartProps {
    data: ExpenseBreakdownItem[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{d.label}</span>
            </div>
            <p className="font-bold text-lg" style={{ color: d.color }}>
                Bs {d.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
        </div>
    );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices < 5%
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay gastos registrados
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={55}
                        dataKey="value"
                        nameKey="label"
                        labelLine={false}
                        label={renderCustomLabel}
                        strokeWidth={2}
                        stroke="#ffffff"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        formatter={(value: string) => (
                            <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground mt-1">
                Total: <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Bs {total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
            </p>
        </div>
    );
}
