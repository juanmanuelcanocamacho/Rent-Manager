'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui/shared';
import { updateNotificationPreferences } from '@/actions/settings';
import type { UserNotificationPreferences } from '@prisma/client';

interface NotificationPreferencesFormProps {
    preferences: UserNotificationPreferences;
}

export function NotificationPreferencesForm({ preferences }: NotificationPreferencesFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [prefs, setPrefs] = useState({
        emailEnabled: preferences.emailEnabled,
        invoiceReminders: preferences.invoiceReminders,
        expenseNotifications: preferences.expenseNotifications,
        contractNotifications: preferences.contractNotifications,
        weeklySummary: preferences.weeklySummary,
        monthlySummary: preferences.monthlySummary,
    });

    const handleToggle = (key: keyof typeof prefs) => {
        setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            await updateNotificationPreferences(prefs);
            setMessage('✅ Preferencias guardadas correctamente');
        } catch (error) {
            setMessage('❌ Error al guardar las preferencias');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Notificaciones por Email</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configura qué notificaciones quieres recibir por correo electrónico
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Email Enabled */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="emailEnabled" className="font-medium cursor-pointer">
                                Habilitar emails
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Activa o desactiva todas las notificaciones por email
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="emailEnabled"
                            checked={prefs.emailEnabled}
                            onChange={() => handleToggle('emailEnabled')}
                            className="h-5 w-5 cursor-pointer"
                        />
                    </div>

                    {/* Invoice Reminders */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="invoiceReminders" className="font-medium cursor-pointer">
                                Recordatorios de facturas
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Recibe avisos cuando una factura está próxima a vencer o está vencida
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="invoiceReminders"
                            checked={prefs.invoiceReminders}
                            onChange={() => handleToggle('invoiceReminders')}
                            disabled={!prefs.emailEnabled}
                            className="h-5 w-5 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    {/* Expense Notifications */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="expenseNotifications" className="font-medium cursor-pointer">
                                Notificaciones de gastos
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Recibe avisos sobre gastos pendientes de aprobación
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="expenseNotifications"
                            checked={prefs.expenseNotifications}
                            onChange={() => handleToggle('expenseNotifications')}
                            disabled={!prefs.emailEnabled}
                            className="h-5 w-5 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    {/* Contract Notifications */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="contractNotifications" className="font-medium cursor-pointer">
                                Notificaciones de contratos
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Recibe avisos sobre vencimientos y renovaciones de contratos
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="contractNotifications"
                            checked={prefs.contractNotifications}
                            onChange={() => handleToggle('contractNotifications')}
                            disabled={!prefs.emailEnabled}
                            className="h-5 w-5 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    {/* Weekly Summary */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="weeklySummary" className="font-medium cursor-pointer">
                                Resumen semanal
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Recibe un resumen semanal de tu actividad
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="weeklySummary"
                            checked={prefs.weeklySummary}
                            onChange={() => handleToggle('weeklySummary')}
                            disabled={!prefs.emailEnabled}
                            className="h-5 w-5 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    {/* Monthly Summary */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <label htmlFor="monthlySummary" className="font-medium cursor-pointer">
                                Resumen mensual
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Recibe un resumen mensual con estadísticas detalladas
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            id="monthlySummary"
                            checked={prefs.monthlySummary}
                            onChange={() => handleToggle('monthlySummary')}
                            disabled={!prefs.emailEnabled}
                            className="h-5 w-5 cursor-pointer disabled:opacity-50"
                        />
                    </div>
                </div>
            </Card>

            {message && (
                <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg">
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </div>
        </div>
    );
}
