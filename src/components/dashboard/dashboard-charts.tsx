'use client';

import { useState, useEffect, useTransition } from 'react';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Home } from 'lucide-react';
import { RevenueChart } from './revenue-chart';
import { OccupancyChart } from './occupancy-chart';
import { ExpenseBreakdownChart } from './expense-breakdown-chart';
import { PaymentStatusChart } from './payment-status-chart';
import { ChartCard } from './chart-card';
import { DateRangeSelector } from './date-range-selector';
import { getDashboardAnalytics, exportDashboardData } from '@/actions/dashboard';
import type {
    RevenueDataPoint,
    OccupancyDataPoint,
    ExpenseBreakdownItem,
    PaymentStatusItem,
} from '@/lib/dashboard-analytics';

interface DashboardChartsProps {
    initialData: {
        revenue: RevenueDataPoint[];
        occupancy: OccupancyDataPoint[];
        expenses: ExpenseBreakdownItem[];
        payments: PaymentStatusItem[];
    };
}

export function DashboardCharts({ initialData }: DashboardChartsProps) {
    const [months, setMonths] = useState(6);
    const [data, setData] = useState(initialData);
    const [isPending, startTransition] = useTransition();
    const [isExporting, setIsExporting] = useState(false);

    // Fetch new data when months change
    useEffect(() => {
        if (months === 6) {
            setData(initialData);
            return;
        }

        startTransition(async () => {
            const newData = await getDashboardAnalytics(months);
            setData(newData);
        });
    }, [months, initialData]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csv = await exportDashboardData(months);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard_analytics_${months}m.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BarChart3 className="text-primary" size={22} />
                    Analíticas
                </h2>
                <DateRangeSelector
                    value={months}
                    onChange={setMonths}
                    onExport={handleExport}
                    isExporting={isExporting}
                />
            </div>

            {/* Loading overlay */}
            <div className={`transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard
                        title="Ingresos y Gastos"
                        description={`Últimos ${months} meses`}
                        icon={<TrendingUp size={18} />}
                    >
                        <RevenueChart data={data.revenue} />
                    </ChartCard>

                    <ChartCard
                        title="Tasa de Ocupación"
                        description="Porcentaje de habitaciones ocupadas"
                        icon={<Home size={18} />}
                    >
                        <OccupancyChart data={data.occupancy} />
                    </ChartCard>

                    <ChartCard
                        title="Desglose de Gastos"
                        description="Por categoría"
                        icon={<PieChartIcon size={18} />}
                    >
                        <ExpenseBreakdownChart data={data.expenses} />
                    </ChartCard>

                    <ChartCard
                        title="Estado de Facturas"
                        description="Pagadas vs Pendientes vs Vencidas"
                        icon={<BarChart3 size={18} />}
                    >
                        <PaymentStatusChart data={data.payments} />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
}
