'use client';

import { useEffect } from 'react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl font-semibold">Something went wrong!</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
                We couldn't load your dashboard data.
            </p>
            <button
                onClick={reset}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
                Try again
            </button>
        </div>
    );
}
