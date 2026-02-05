import { db } from '@/lib/db';
import { getNowInMadrid } from '@/lib/dates';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const secret = request.headers.get('x-worker-secret');
    if (secret !== process.env.WORKER_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = getNowInMadrid();
    // Ensure we compare dates properly. dueDate is stored as Date (midnight).
    // If today > dueDate, it's overdue.

    // Find pending invoices where dueDate < today
    const result = await db.invoice.updateMany({
        where: {
            status: 'PENDING',
            dueDate: { lt: today }
        },
        data: {
            status: 'OVERDUE'
        }
    });

    return NextResponse.json({
        success: true,
        updated: result.count,
        dateUsed: today.toISOString()
    });
}
