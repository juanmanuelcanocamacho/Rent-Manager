'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/shared';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/money';

interface RevenueChartProps {
    data: any[];
    country: 'SPAIN' | 'BOLIVIA';
}

export function RevenueChart({ data, country }: RevenueChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Card className="p-6 h-[400px] flex items-center justify-center animate-pulse"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></Card>;
    }

    const formatCurrency = (value: number) => {
        return formatMoney(value * 100, country); // The util takes cents, our data is full numbers
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium text-sm mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground capitalize">{entry.name}:</span>
                            <span className="font-semibold">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="p-4 md:p-6 w-full h-full min-h-[400px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">Resumen Financiero</h3>
                <p className="text-sm text-muted-foreground">Evolución de ingresos y gastos (Últimos 6 meses)</p>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => {
                                if (value === 0) return '0';
                                return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
