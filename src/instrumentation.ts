/**
 * Next.js Instrumentation
 * This file runs once when the server starts
 * Perfect for initializing cron jobs and other server-side setup
 */

export async function register() {
    // Only run on server side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initializeCronJobs } = await import('./lib/cron-jobs');
        const { verifyEmailConfig } = await import('./lib/email');

        console.log('🚀 Server starting - initializing email notification system...');

        // Verify email configuration
        const isValid = await verifyEmailConfig();

        if (isValid) {
            console.log('✅ Email configuration verified');
            // Initialize cron jobs
            initializeCronJobs();
        } else {
            console.warn('⚠️  Email configuration is invalid. Cron jobs will not be initialized.');
            console.warn('   Please check your SMTP settings in .env');
        }
    }
}
