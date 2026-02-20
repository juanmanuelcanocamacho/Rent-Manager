import { Card } from '@/components/ui/shared';
import { formatMoney } from '@/lib/money';
import { Briefcase, CreditCard, Receipt, FileText, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentActivityFeedProps {
    activities: any[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <Card className="p-6 flex flex-col items-center justify-center text-center opacity-70 border-dashed min-h-[300px]">
                <Clock size={48} className="text-slate-300 mb-4" />
                <h3 className="font-medium text-slate-800 dark:text-slate-200">No hay actividad reciente</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">Aquí aparecerán los cobros, gastos y contratos nuevos a medida que se generen en tu cuenta.</p>
            </Card>
        );
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'PAYMENT':
                return <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full"><ArrowDownRight size={18} /></div>;
            case 'EXPENSE':
                return <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full"><ArrowUpRight size={18} /></div>;
            case 'LEASE_CREATED':
                return <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full"><FileText size={18} /></div>;
            default:
                return <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-full"><CheckCircle2 size={18} /></div>;
        }
    };

    return (
        <Card className="w-full flex flex-col h-full">
            <div className="p-4 md:p-6 pb-2 border-b/50">
                <h3 className="text-lg font-semibold">Últimos Movimientos</h3>
                <p className="text-sm text-muted-foreground">Tu historial de actividad reciente</p>
            </div>

            <div className="p-4 md:p-6 flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-5 space-y-8 pb-4">
                    {activities.map((activity, idx) => (
                        <div key={activity.id} className="relative pl-6 sm:pl-8 group">
                            {/* Timeline Dot/Icon */}
                            <div className="absolute -left-[21px] top-0 bg-background pt-1">
                                {getActivityIcon(activity.type)}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 mt-1">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                                        {activity.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                        {activity.description}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                                    {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                                </span>
                            </div>
                            {/* Mobile time */}
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap block sm:hidden mt-2">
                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: es })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
