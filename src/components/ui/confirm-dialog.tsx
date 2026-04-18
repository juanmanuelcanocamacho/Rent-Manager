'use client';

import { useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/shared';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    trigger: ReactNode;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void> | Promise<{ error?: string } | any>;
    variant?: 'destructive' | 'primary';
}

export function ConfirmDialog({
    trigger,
    title = '¿Estás seguro?',
    description = 'Esta acción no se puede deshacer.',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    variant = 'destructive'
}: ConfirmDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await onConfirm();
            
            // If the action returned an object with an error, show it
            if (result && typeof result === 'object' && result.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
            }
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div onClick={(e) => { e.stopPropagation(); setIsOpen(true); }} className="cursor-pointer inline-block">
                {trigger}
            </div>
            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${variant === 'destructive' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-900'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">{title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1 duration-200">
                                <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-600 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                disabled={loading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={variant === 'primary' ? 'primary' : 'destructive'}
                                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                                disabled={loading}
                            >
                                {loading ? 'Procesando...' : confirmText}
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
