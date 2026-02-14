'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/shared';
import { Calendar, Download } from 'lucide-react';

interface DateRangeSelectorProps {
    value: number;
    onChange: (months: number) => void;
    onExport?: () => void;
    isExporting?: boolean;
}

const options = [
    { label: '3M', value: 3 },
    { label: '6M', value: 6 },
    { label: '12M', value: 12 },
];

export function DateRangeSelector({ value, onChange, onExport, isExporting }: DateRangeSelectorProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Período:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onChange(opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${value === opt.value
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {onExport && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={isExporting}
                    className="text-xs gap-1.5"
                >
                    <Download size={14} />
                    {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </Button>
            )}
        </div>
    );
}
