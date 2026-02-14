'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/shared';
import { Download } from 'lucide-react';

interface ChartCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export function ChartCard({ title, description, children, icon }: ChartCardProps) {
    return (
        <Card className="p-4 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon && (
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">{title}</h3>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="min-h-[280px]">
                {children}
            </div>
        </Card>
    );
}
