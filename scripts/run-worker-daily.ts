import 'dotenv/config';

async function main() {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const secret = process.env.WORKER_SECRET;

    if (!secret) {
        console.error('WORKER_SECRET is not defined');
        process.exit(1);
    }

    console.log('Running daily worker tasks...');

    try {
        // 1. Recompute Overdue
        console.log('Calling /api/worker/recompute-overdue...');
        const res1 = await fetch(`${baseUrl}/api/worker/recompute-overdue`, {
            method: 'POST',
            headers: { 'x-worker-secret': secret }
        });
        console.log('Recompute status:', res1.status, await res1.json());

        // 2. Send Reminders
        console.log('Calling /api/worker/send-whatsapp-reminders...');
        const res2 = await fetch(`${baseUrl}/api/worker/send-whatsapp-reminders`, {
            method: 'POST',
            headers: { 'x-worker-secret': secret }
        });
        console.log('Reminders status:', res2.status, await res2.json());

    } catch (error) {
        console.error('Error running worker script:', error);
        process.exit(1);
    }
}

main();
