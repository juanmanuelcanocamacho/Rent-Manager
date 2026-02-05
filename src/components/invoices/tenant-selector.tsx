'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

type TenantSelectorProps = {
    tenants: { id: string; fullName: string }[];
};

export function TenantSelector({ tenants }: TenantSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentTenantId = searchParams.get('tenantId') || '';

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const tenantId = e.target.value;
        const params = new URLSearchParams(searchParams);

        if (tenantId) {
            params.set('tenantId', tenantId);
        } else {
            params.delete('tenantId');
        }

        // Reset page if needed, or keep other existing params like status/due
        router.push(`/invoices?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <select
                value={currentTenantId}
                onChange={handleChange}
                className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <option value="">Todos los inquilinos</option>
                {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                        {tenant.fullName}
                    </option>
                ))}
            </select>
        </div>
    );
}
