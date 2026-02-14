'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import type { PaymentStatusItem } from '@/lib/dashboard-analytics';

interface PaymentStatusChartProps {
    data: PaymentStatusItem[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{d.label}</p>
            <p className="text-slate-600 dark:text-slate-400">
                {d.count} factura{d.count !== 1 ? 's' : ''}
            </p>
            <p className="font-bold text-lg" style={{ color: d.color }}>
                Bs {d.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
        </div>
    );
};

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
    if (!data.length || data.every(d => d.count === 0)) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos de facturas disponibles
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar
                    dataKey="amount"
                    name="Monto"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
