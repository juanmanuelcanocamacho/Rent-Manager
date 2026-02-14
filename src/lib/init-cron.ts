// Initialize cron jobs when the application starts
import { initializeCronJobs } from '@/lib/cron-jobs';
import { verifyEmailConfig } from '@/lib/email';

// Only run on server side
if (typeof window === 'undefined') {
    // Verify email configuration
    verifyEmailConfig().then((isValid) => {
        if (isValid) {
            // Initialize cron jobs
            initializeCronJobs();
        } else {
            console.warn('⚠️  Email configuration is invalid. Cron jobs will not be initialized.');
            console.warn('   Please check your SMTP settings in .env');
        }
    });
}

export { };
