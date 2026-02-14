import nodemailer from 'nodemailer';
import { EmailNotification, NotificationType, EmailStatus } from '@prisma/client';
import { db } from './db';

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
    type: NotificationType;
    recipientId: string;
    metadata?: Record<string, any>;
}

/**
 * Send an email and log it to the database
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailNotification> {
    const { to, subject, html, text, type, recipientId, metadata } = params;

    // Create email notification record
    const notification = await db.emailNotification.create({
        data: {
            type,
            recipientId,
            subject,
            body: html,
            status: EmailStatus.PENDING,
            metadata: metadata ? JSON.stringify(metadata) : null,
        },
    });

    try {
        // Send email
        await transporter.sendMail({
            from: `"Rent Manager" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: text || subject,
            html,
        });

        // Update notification as sent
        return await db.emailNotification.update({
            where: { id: notification.id },
            data: {
                status: EmailStatus.SENT,
                sentAt: new Date(),
            },
        });
    } catch (error) {
        // Update notification as failed
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return await db.emailNotification.update({
            where: { id: notification.id },
            data: {
                status: EmailStatus.FAILED,
                error: errorMessage,
            },
        });
    }
}

/**
 * Check if user has email notifications enabled
 */
export async function canSendEmail(userId: string, type: NotificationType): Promise<boolean> {
    const prefs = await db.userNotificationPreferences.findUnique({
        where: { userId },
    });

    if (!prefs || !prefs.emailEnabled) {
        return false;
    }

    // Check specific notification type preferences
    switch (type) {
        case NotificationType.INVOICE_DUE_SOON:
        case NotificationType.INVOICE_OVERDUE:
        case NotificationType.PAYMENT_RECEIVED:
            return prefs.invoiceReminders;
        case NotificationType.EXPENSE_PENDING_APPROVAL:
            return prefs.expenseNotifications;
        case NotificationType.CONTRACT_EXPIRING:
            return prefs.contractNotifications;
        case NotificationType.WEEKLY_SUMMARY:
            return prefs.weeklySummary;
        case NotificationType.MONTHLY_SUMMARY:
            return prefs.monthlySummary;
        default:
            return true;
    }
}

/**
 * Get or create notification preferences for a user
 */
export async function getNotificationPreferences(userId: string) {
    let prefs = await db.userNotificationPreferences.findUnique({
        where: { userId },
    });

    if (!prefs) {
        prefs = await db.userNotificationPreferences.create({
            data: { userId },
        });
    }

    return prefs;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    userId: string,
    updates: Partial<Omit<typeof db.userNotificationPreferences.create, 'userId' | 'id' | 'createdAt' | 'updatedAt'>>
) {
    return await db.userNotificationPreferences.upsert({
        where: { userId },
        create: {
            userId,
            ...updates,
        },
        update: updates,
    });
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server verification failed:', error);
        return false;
    }
}
