'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/ui/shared';
import { KeyRound, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { resetManagerPassword } from '@/actions/team';
import { createPortal } from 'react-dom';

export function ResetPasswordDialog({ managerId, managerName }: { managerId: string, managerName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData(e.currentTarget);
        const res = await resetManagerPassword(managerId, formData);

        if (res?.error) {
            setError(res.error);
        } else {
            setSuccess("Contraseña actualizada.");
            setTimeout(() => {
                setIsOpen(false);
                setSuccess(null);
            }, 1500);
        }
        setLoading(false);
    };

    return (
        <>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className="text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                title="Resetear Contraseña"
            >
                <KeyRound size={18} />
            </Button>

            {isOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                >
                    <Card 
                        className="max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border-amber-200/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
                                <p className="text-sm text-muted-foreground">Nueva clave para {managerName}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Nueva Contraseña</label>
                                <Input 
                                    name="password" 
                                    type="text" 
                                    placeholder="Mínimo 6 caracteres" 
                                    required 
                                    minLength={6}
                                    className="h-12 border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                                    autoFocus
                                    autoComplete="off"
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-in shake duration-300">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 animate-in slide-in-from-top-1 duration-200">
                                    <ShieldCheck size={14} />
                                    {success}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setIsOpen(false)} 
                                    className="flex-1 h-12 rounded-xl"
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Actualizar"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>,
                document.body
            )}
        </>
    );
}
