'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/shared';
import { ChevronLeft } from 'lucide-react';

// All pages directly accessible from the sidebar or main nav.
// The back button should NOT appear on any of these.
const TOP_LEVEL_PAGES = [
    '/dashboard',
    '/rooms',
    '/tenants',
    '/leases',
    '/invoices',
    '/expenses',
    '/reports',
    '/team',
    '/profile',
    '/me',
    '/me/invoices',
    '/manager/dashboard',
    '/manager/invoices',
    '/manager/expenses',
    '/manager/tenants',
    '/manager/leases',
];

export function BackButton() {
    const pathname = usePathname() ?? '';

    // Show the button only if the current path is NOT a top-level page
    const isTopLevel = TOP_LEVEL_PAGES.some(
        (page) => pathname === page
    );

    if (isTopLevel) return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mb-4 text-muted-foreground hover:text-primary gap-1 pl-0"
        >
            <ChevronLeft size={16} />
            Volver
        </Button>
    );
}
