'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/shared';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show back button on main dashboard
    if (pathname === '/dashboard') return null;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 text-muted-foreground hover:text-primary gap-1 pl-0"
        >
            <ChevronLeft size={16} />
            Volver
        </Button>
    );
}
