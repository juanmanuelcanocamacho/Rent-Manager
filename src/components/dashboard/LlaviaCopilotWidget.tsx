'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/shared';
import { Sparkles } from 'lucide-react';
import { generateCopilotSummary } from '@/actions/dashboard';
import Link from 'next/link';

export function LlaviaCopilotWidget() {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAI() {
            try {
                const text = await generateCopilotSummary();
                setSummary(text);
            } catch (error) {
                console.error(error);
                setSummary("No se pudo cargar el análisis inteligente del asistente en este momento.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAI();
    }, []);

    return (
        <Card className="p-5 md:p-6 w-full relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20 shadow-sm transition-all hover:shadow-md group">
            <div className="flex items-start gap-4 z-10 relative">
                <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shrink-0 mt-1">
                    <Sparkles className="text-white w-5 h-5" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            Llavia Copilot
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2 mt-3 w-full animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-4/6"></div>
                        </div>
                    ) : (
                        <div className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {summary}
                        </div>
                    )}

                    {!isLoading && summary && summary.includes("factura") && (
                        <div className="mt-4 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Link href="/invoices" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                                Ir a Gestión de Facturas <span aria-hidden="true">&rarr;</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Background decoration elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply flex-none pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl mix-blend-multiply flex-none pointer-events-none"></div>
        </Card>
    );
}
