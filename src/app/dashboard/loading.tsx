export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
                    />
                ))}
            </div>

            <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
    );
}
