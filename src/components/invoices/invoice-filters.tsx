'use client';

import { Search } from 'lucide-react';
import ReportGenerator from '@/components/reports/ReportGenerator';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/use-debounce';

interface InvoiceFiltersProps {
    tenants: { id: string; fullName: string }[];
}

export function InvoiceFilters({ tenants }: InvoiceFiltersProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleStatus = (newStatus: string) => {
        const params = new URLSearchParams(searchParams);
        if (newStatus && newStatus !== 'ALL') {
            params.set('status', newStatus);
        } else {
            params.delete('status');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur-sm border-b pb-4 pt-2 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
            <div className="flex-1 flex gap-4 overflow-x-auto pb-2 md:pb-0 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        placeholder="Buscar..."
                        defaultValue={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 pl-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0 overflow-x-auto">
                    {['ALL', 'OVERDUE', 'UP_TO_DATE', 'UPCOMING'].map((s) => {
                        const labels: Record<string, string> = {
                            'ALL': 'Todas',
                            'OVERDUE': 'Vencidas',
                            'UP_TO_DATE': 'Al día',
                            'UPCOMING': 'Por vencer'
                        };
                        const isActive = status === s;
                        return (
                            <button
                                key={s}
                                onClick={() => handleStatus(s)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${isActive ? 'bg-background shadow-sm text-foreground ring-1 ring-black/5 dark:ring-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                            >
                                {labels[s]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PDF Report Generator Trigger - Condensed */}
            <div className="hidden md:block">
                <ReportGenerator tenants={tenants} condensed />
            </div>
        </div>
    );
}
