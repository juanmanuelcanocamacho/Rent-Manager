'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { OccupancyDataPoint } from '@/lib/dashboard-analytics';

interface OccupancyChartProps {
    data: OccupancyDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
            <p className="text-emerald-600 font-bold text-lg">{d?.ocupacion}%</p>
            <p className="text-slate-500 text-xs">{d?.ocupadas} de {d?.total} habitaciones</p>
        </div>
    );
};

export function OccupancyChart({ data }: OccupancyChartProps) {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                No hay datos de ocupación disponibles
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                    y={80}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Objetivo 80%', position: 'right', fontSize: 11, fill: '#f59e0b' }}
                />
                <Area
                    type="monotone"
                    dataKey="ocupacion"
                    name="Ocupación"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorOcupacion)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
