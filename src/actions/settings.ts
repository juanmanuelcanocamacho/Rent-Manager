'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateNotificationPreferences(preferences: {
    emailEnabled: boolean;
    invoiceReminders: boolean;
    expenseNotifications: boolean;
    contractNotifications: boolean;
    weeklySummary: boolean;
    monthlySummary: boolean;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('No autenticado');
    }

    await db.userNotificationPreferences.upsert({
        where: { userId: session.user.id },
        update: preferences,
        create: {
            userId: session.user.id,
            ...preferences,
        },
    });

    revalidatePath('/settings');
    revalidatePath('/me/settings');
}
