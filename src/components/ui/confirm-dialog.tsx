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
    onConfirm: () => void | Promise<void>;
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

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            setIsOpen(false);
        } catch (error) {
            console.error(error);
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
