'use server'

import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const createTenantSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    documentNumber: z.string().optional(),
    notes: z.string().optional(),
    whatsappOptIn: z.string().optional(),
});

export async function createTenant(formData: FormData) {
    await requireLandlord();

    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email') || undefined,
        phone: formData.get('phone') || undefined,
        documentNumber: formData.get('documentNumber') || undefined,
        notes: formData.get('notes') || undefined,
        whatsappOptIn: formData.get('whatsappOptIn') || undefined,
    };

    const parsed = createTenantSchema.parse(data);

    // Auto-generate email if missing: name@alquiler.com
    let emailToUse = parsed.email;
    if (!emailToUse) {
        const sanitized = parsed.fullName
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
        // Add minimal randomness to avoid collision if needed, but per request just name@alquiler.com
        // We'll trust sanitized name is unique enough for now or Prisma will throw (we might want to catch that).
        // Let's stick to simple generation as requested.
        emailToUse = `${sanitized}@alquiler.com`;
    }

    // Generate secure-ish friendly password: Name + 4 digits + Special Char
    const firstName = (parsed.fullName as string).split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    const specialChars = "!@#$%&*";
    const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    const tempPassword = `${firstName}${randomDigits}${specialChar}`;

    const hash = await bcrypt.hash(tempPassword, 10);

    // Transaction to create User and Profile
    await db.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: emailToUse as string,
                passwordHash: hash,
                role: 'TENANT',
            },
        });

        await tx.tenantProfile.create({
            data: {
                userId: user.id,
                fullName: parsed.fullName as string,
                // @ts-ignore: Prisma client type might be stale, field is optional in DB
                phoneE164: parsed.phone || undefined,
                documentNumber: parsed.documentNumber,
                notes: parsed.notes as string,
                whatsappOptIn: parsed.whatsappOptIn === 'on',
                generatedPassword: tempPassword,
            },
        });
    });

    console.log(`Created tenant ${emailToUse} with password: ${tempPassword}`);

    revalidatePath('/tenants');
}

export async function updateTenant(formData: FormData) {
    await requireLandlord();

    const id = formData.get('id') as string;
    if (!id) throw new Error("Tenant ID required");

    // Reuse schema but email is optional if not changing (or handle separately)
    // For simplicity, we re-parse everything.
    // If email changes, we might need to check uniqueness, but Prisma will throw if constraint fails.

    // We treat 'email' as read-only for now in this MVP to avoid changing User login easily 
    // without complexity (auth sessions etc). 
    // OR we allow it. Let's allow it but warn.

    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        documentNumber: formData.get('documentNumber') || undefined,
        notes: formData.get('notes') || undefined,
        whatsappOptIn: formData.get('whatsappOptIn') || undefined,
    };

    const parsed = createTenantSchema.parse(data);

    await db.$transaction(async (tx) => {
        const tenant = await tx.tenantProfile.findUnique({ where: { id }, include: { user: true } });
        if (!tenant) throw new Error("Tenant not found");

        // Update User if email changed
        if (tenant.user.email !== parsed.email) {
            await tx.user.update({
                where: { id: tenant.userId },
                data: { email: parsed.email as string }
            });
        }

        // Update Profile
        await tx.tenantProfile.update({
            where: { id },
            data: {
                fullName: parsed.fullName as string,
                phoneE164: parsed.phone as string,
                documentNumber: parsed.documentNumber,
                notes: parsed.notes as string,
                whatsappOptIn: parsed.whatsappOptIn === 'on',
            }
        });
    });

    revalidatePath('/tenants');
    revalidatePath(`/tenants/${id}`);
}

export async function deleteTenant(tenantId: string) {
    await requireLandlord();

    await db.$transaction(async (tx) => {
        const tenant = await tx.tenantProfile.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error("Tenant not found");

        const userId = tenant.userId;

        // 1. Delete all Leases for this tenant
        // We need to fetch them to delete related records
        const leases = await tx.lease.findMany({
            where: { tenantId },
            include: { rooms: true }
        });

        for (const lease of leases) {
            // Delete invoice/payment/notification/message for each lease
            // Same logic as deleteLease
            const invoices = await tx.invoice.findMany({ where: { leaseId: lease.id } });
            const invoiceIds = invoices.map(i => i.id);

            if (invoiceIds.length > 0) {
                await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
                await tx.notificationLog.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
            }

            await tx.invoice.deleteMany({ where: { leaseId: lease.id } });
            await tx.message.deleteMany({ where: { leaseId: lease.id } });
            await tx.notificationLog.deleteMany({ where: { leaseId: lease.id } });

            await tx.lease.delete({ where: { id: lease.id } });

            // Set Room to AVAILABLE if active
            if (lease.status === 'ACTIVE' && lease.rooms.length > 0) {
                await tx.room.updateMany({
                    where: { id: { in: lease.rooms.map(r => r.id) } },
                    data: { status: 'AVAILABLE' }
                });
            }
        }

        // 2. Delete Tenant Profile is automatic if we delete User (due to schema Relation?), 
        // BUT schema says: user User @relation(...)
        // Usually User -> TenantProfile relation might NOT cascade delete User if we delete TenantProfile.
        // But if we delete USER, TenantProfile should go.
        // Let's delete the USER.

        // However, TenantProfile -> Messages (relation?)
        // Messages are linked to TenantProfile as well.
        await tx.message.deleteMany({ where: { tenantId } });

        // Finally delete the User
        await tx.user.delete({ where: { id: userId } });
    });

    revalidatePath('/tenants');
    revalidatePath('/leases');
    revalidatePath('/dashboard');
    revalidatePath('/invoices');
}


