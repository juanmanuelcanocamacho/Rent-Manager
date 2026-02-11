'use server';

import { db } from '@/lib/db';
import { requireLandlord, requireManagementAccess, getSessionUser, getLandlordContext } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { ExpenseCategory, ExpenseStatus, Role } from '@prisma/client';

export async function createExpense(formData: FormData) {
    const user = await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const description = formData.get('description') as string;
    const amountStr = formData.get('amount') as string;
    const dateStr = formData.get('date') as string;
    const category = formData.get('category') as ExpenseCategory;
    const roomId = formData.get('roomId') as string;

    if (!description || !amountStr || !dateStr || !category) {
        throw new Error('Faltan campos obligatorios');
    }

    const amount = parseFloat(amountStr);
    const amountCents = Math.round(amount * 100);

    // Determine status based on role
    const status = user.role === Role.LANDLORD ? ExpenseStatus.APPROVED : ExpenseStatus.PENDING;

    await db.expense.create({
        data: {
            landlordId: landlordId,
            description,
            amountCents,
            date: new Date(dateStr),
            category,
            roomId: roomId || null,
            status: status
        }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
}

export async function deleteExpense(id: string) {
    const user = await requireManagementAccess();
    const landlordId = await getLandlordContext();

    const expense = await db.expense.findUnique({
        where: { id_landlordId: { id, landlordId } }
    });
    if (!expense) return;

    // Managers can only delete if pending? Or strictly no delete?
    // Plan said: "Hide standard Delete button for approved expenses". 
    // Let's restrict delete to Landlord OR (Manager if Pending).

    if (user.role !== Role.LANDLORD) {
        if (expense.status === ExpenseStatus.APPROVED) {
            throw new Error("No tienes permiso para borrar gastos aprobados");
        }
    }

    await db.expense.delete({
        where: { id_landlordId: { id, landlordId } }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
}

export async function approveExpense(id: string) {
    const landlordId = await getLandlordContext();

    await db.expense.update({
        where: { id_landlordId: { id, landlordId } },
        data: { status: ExpenseStatus.APPROVED }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
}

export async function rejectExpense(id: string) {
    const landlordId = await getLandlordContext();

    await db.expense.update({
        where: { id_landlordId: { id, landlordId } },
        data: { status: ExpenseStatus.REJECTED }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
}
