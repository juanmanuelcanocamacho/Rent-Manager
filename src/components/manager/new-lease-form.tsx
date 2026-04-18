'use client';

import { createLease } from '@/actions/leases';
import { Button, Card, Input } from '@/components/ui/shared';
import { FilePlus, Home, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Room { id: string; name: string; }
interface Tenant { id: string; fullName: string; }

interface NewLeaseFormProps {
    rooms: Room[];
    tenants: Tenant[];
}

export function NewLeaseForm({ rooms, tenants }: NewLeaseFormProps) {
    const [roomError, setRoomError] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const form = e.currentTarget;
        const checked = form.querySelectorAll('input[name="roomIds"]:checked');
        if (checked.length === 0) {
            e.preventDefault();
            setRoomError(true);
            // Scroll to the room section
            form.querySelector('[data-room-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setRoomError(false);
        }
    };

    return (
        <Card className="p-6 md:p-8 shadow-xl border-t-4 border-t-blue-500 rounded-3xl">
            <form action={createLease} onSubmit={handleSubmit} className="space-y-6">

                {/* Select Properties */}
                <div data-room-section>
                    <label className={`text-sm font-bold flex items-center gap-2 mb-3 px-1 ${roomError ? 'text-red-600' : ''}`}>
                        <Home size={16} className={roomError ? 'text-red-500' : 'text-blue-500'} />
                        Propiedad a Asignar
                        <span className="text-red-500 text-base leading-none">*</span>
                    </label>
                    {roomError && (
                        <div className="flex items-center gap-2 text-red-600 text-xs font-semibold mb-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            <AlertCircle size={14} />
                            Debes seleccionar al menos una propiedad para continuar.
                        </div>
                    )}
                    <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border-2 ${roomError ? 'border-red-400 bg-red-50/30' : 'border-dashed border-muted-foreground/20 bg-muted/30'} max-h-48 overflow-y-auto`}>
                        {rooms.map(r => (
                            <div
                                key={r.id}
                                className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    name="roomIds"
                                    value={r.id}
                                    id={`room-${r.id}`}
                                    onChange={() => setRoomError(false)}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`room-${r.id}`} className="text-sm font-medium cursor-pointer select-none">
                                    {r.name}
                                </label>
                            </div>
                        ))}
                        {rooms.length === 0 && (
                            <p className="text-xs text-muted-foreground col-span-2 py-4 text-center">
                                No hay propiedades disponibles.
                            </p>
                        )}
                    </div>
                </div>

                {/* Select Tenant */}
                <div>
                    <label className="text-sm font-bold flex items-center gap-2 mb-2 px-1">
                        <User size={16} className="text-blue-500" />
                        Inquilino
                        <span className="text-red-500 text-base leading-none">*</span>
                    </label>
                    <select
                        name="tenantId"
                        required
                        className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="">Seleccionar inquilino...</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Fecha de Inicio <span className="text-red-500">*</span></label>
                        <Input name="startDate" type="date" required className="h-12 text-base rounded-xl" />
                    </div>
                    <div>
                        <label className="text-sm font-bold block mb-2 px-1">Duración (meses)</label>
                        <Input name="duration" type="number" defaultValue="12" min="1" className="h-12 text-base rounded-xl" />
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">Cuántos meses de facturas generar</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold block mb-2 px-1">Renta Mensual (Bs) <span className="text-red-500">*</span></label>
                    <Input name="rentAmountCents" type="number" step="0.01" placeholder="350.00" required className="h-12 text-base rounded-xl font-mono" />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        type="submit"
                        className="h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        disabled={rooms.length === 0}
                    >
                        <FilePlus size={20} className="mr-2" /> Generar Contrato
                    </Button>
                    <Button variant="ghost" asChild className="h-12 text-muted-foreground">
                        <Link href="/manager/dashboard">Volver</Link>
                    </Button>
                </div>
            </form>
        </Card>
    );
}
