'use client';

import { useActionState, useState } from 'react';
import { updateProfile } from '@/actions/profile';
import { Button, Card, Input, Badge } from '@/components/ui/shared';
import { User, Phone, Globe, ShieldCheck, Save, Loader2, AlertCircle, CheckCircle2, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileFormProps {
    user: {
        id: string;
        name: string | null;
        username: string | null;
        email: string | null;
        phone: string | null;
        country: string;
        documentNumber: string | null;
        documentIssuedIn: string | null;
        maritalStatus: string | null;
        legalAddress: string | null;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [state, formAction, isPending] = useActionState(updateProfile, null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <form action={formAction} className="space-y-8">
            {/* Status Messages */}
            {(state?.error || state?.success) && (
                <div className={cn(
                    "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                    state.error ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                )}>
                    {state.error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <p className="text-sm font-bold">{state.error || state.success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Información General</h2>
                                <p className="text-sm text-muted-foreground">Tu identidad básica en la plataforma</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Nombre Completo</label>
                                <Input 
                                    name="name" 
                                    defaultValue={user.name || ''} 
                                    placeholder="Ej: Juan Pérez"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Nombre de Usuario</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">@</span>
                                    <Input 
                                        name="username" 
                                        defaultValue={user.username || ''} 
                                        placeholder="usuario"
                                        className="h-12 pl-8"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Email (Cuenta)</label>
                                <Input 
                                    value={user.email || ''} 
                                    disabled 
                                    className="h-12 bg-muted/50 cursor-not-allowed"
                                />
                                <p className="text-[10px] text-muted-foreground font-bold italic ml-1">* El email es el identificador principal y no se puede cambiar.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Teléfono de Contacto</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input 
                                        name="phone" 
                                        defaultValue={user.phone || ''} 
                                        placeholder="+34 600 000 000"
                                        className="h-12 pl-12"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Datos Legales (para Contratos)</h2>
                                <p className="text-sm text-muted-foreground">Información necesaria para la firma de contratos en Bolivia</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Número de C.I. / Documento</label>
                                <Input 
                                    name="documentNumber" 
                                    defaultValue={user.documentNumber || ''} 
                                    placeholder="Ej: 1234567"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Expedido en</label>
                                <Input 
                                    name="documentIssuedIn" 
                                    defaultValue={user.documentIssuedIn || ''} 
                                    placeholder="Ej: Santa Cruz"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Estado Civil</label>
                                <Input 
                                    name="maritalStatus" 
                                    defaultValue={user.maritalStatus || ''} 
                                    placeholder="Ej: Soltero / Casado"
                                    className="h-12"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Domicilio Completo (Propietario)</label>
                                <Input 
                                    name="legalAddress" 
                                    defaultValue={user.legalAddress || ''} 
                                    placeholder="Ej: Calle Florida #123, Santa Cruz"
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Localización y Moneda</h2>
                                <p className="text-sm text-muted-foreground">Configura tu región de operación</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">País de Operación</label>
                                <select
                                    name="country"
                                    defaultValue={user.country}
                                    className="flex h-12 w-full rounded-lg border border-input bg-background/50 px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                >
                                    <option value="BOLIVIA">🇧🇴 Bolivia (Pesos Bolivianos - Bs)</option>
                                    <option value="SPAIN">🇪🇸 España (Euros - €)</option>
                                </select>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-muted/30 border border-dashed text-xs text-muted-foreground">
                                <p className="font-bold mb-1">Nota sobre Moneda:</p>
                                <p>La moneda se ajusta automáticamente según el país seleccionado. Esto afectará a cómo se muestran los montos en tus recibos y reportes.</p>
                            </div>
                        </div>
                    </Card>

                    {/* Security Card */}
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Seguridad y Contraseña</h2>
                                <p className="text-sm text-muted-foreground">Deja los campos en blanco si no quieres cambiar tu contraseña</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Contraseña Actual</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="currentPassword"
                                        type={showCurrent ? 'text' : 'password'}
                                        placeholder="Tu contraseña actual"
                                        className="h-12 pl-12 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Nueva Contraseña</label>
                                <div className="relative">
                                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="newPassword"
                                        type={showNew ? 'text' : 'password'}
                                        placeholder="Mínimo 8 caracteres"
                                        className="h-12 pl-12 pr-12"
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                                <div className="relative">
                                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repite la nueva contraseña"
                                        className="h-12 pl-12 pr-12"
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-medium">
                                🔒 Necesitas introducir tu contraseña actual para poder cambiarla. Si no quieres cambiarla, deja los tres campos vacíos.
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-6">
                    <Card className="p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <Badge variant="success">ACTIVA</Badge>
                        </div>
                        
                        <div className="flex flex-col items-center text-center space-y-4 pt-4">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl">
                                <User size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">{user.name || user.username}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                            </div>
                            
                            <div className="w-full pt-4 space-y-3">
                                <div className="flex justify-between items-center text-xs border-b pb-2">
                                    <span className="text-muted-foreground font-bold">ROL</span>
                                    <span className="font-black text-primary">PROPIETARIO</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b pb-2">
                                    <span className="text-muted-foreground font-bold">CUENTA</span>
                                    <span className="font-black">PERSONAL</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-b pb-2">
                                    <span className="text-muted-foreground font-bold">SEGURIDAD</span>
                                    <div className="flex items-center gap-1 text-emerald-600 font-black">
                                        <ShieldCheck size={12} />
                                        ALTA
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 flex items-center gap-2"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
