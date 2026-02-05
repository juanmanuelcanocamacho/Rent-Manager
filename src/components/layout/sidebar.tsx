'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // wait, do I have lib/utils?
import { Button } from '@/components/ui/shared';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    CreditCard,
    MessageSquare,
    LogOut
} from 'lucide-react';
import { logout } from '@/actions/auth';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/rooms', label: 'Propiedades', icon: Building2 },
    { href: '/tenants', label: 'Inquilinos', icon: Users },
    { href: '/leases', label: 'Contratos', icon: FileText },
    { href: '/invoices', label: 'Facturación', icon: CreditCard },
    { href: '/reports', label: 'Reportes', icon: MessageSquare },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Gestión Alquiler
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                                "w-full justify-start gap-3",
                                isActive && "bg-secondary font-medium"
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <form action={async () => {
                    await logout();
                }}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut size={20} />
                        Cerrar Sesión
                    </Button>
                </form>
            </div>
        </aside>
    );
}

// Mobile Nav could be added later or simple hamburger menu. For now, focus on desktop sidebar + minimal mobile header.
export function MobileHeader() {
    return (
        <header className="md:hidden border-b bg-card p-4 flex items-center justify-between sticky top-0 z-50">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Gestión Alquiler
            </h1>
            {/* Simple mobile menu trigger could go here */}
        </header>
    )
}
