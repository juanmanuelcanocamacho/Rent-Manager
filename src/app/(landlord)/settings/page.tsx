import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { NotificationPreferencesForm } from '@/components/settings/notification-preferences-form';

export default async function LandlordSettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get or create notification preferences
    let preferences = await db.userNotificationPreferences.findUnique({
        where: { userId: session.user.id },
    });

    if (!preferences) {
        // Create default preferences
        preferences = await db.userNotificationPreferences.create({
            data: {
                userId: session.user.id,
                emailEnabled: true,
                invoiceReminders: true,
                expenseNotifications: true,
                contractNotifications: true,
                weeklySummary: true,
                monthlySummary: false,
            },
        });
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona tus preferencias de notificaciones por email
                </p>
            </div>

            <NotificationPreferencesForm preferences={preferences} />
        </div>
    );
}
