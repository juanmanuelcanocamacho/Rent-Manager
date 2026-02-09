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

// Add props to Sidebar
interface SidebarProps {
    notificationCounts?: {
        reports: number;
    }
}

export function Sidebar({ notificationCounts }: SidebarProps) {
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
                    const showBadge = item.href === '/reports' && (notificationCounts?.reports ?? 0) > 0;

                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                                "w-full justify-start gap-3 relative",
                                isActive && "bg-secondary font-medium"
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon size={20} />
                                {item.label}
                                {showBadge && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                    </span>
                                )}
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

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="md:hidden border-b bg-card sticky top-0 z-50">
            <div className="p-4 flex items-center justify-between bg-card">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Gestión Alquiler
                </h1>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 fade-in-20">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-md transition-colors",
                                    isActive ? "bg-secondary font-medium" : "hover:bg-muted"
                                )}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                    <div className="border-t my-2 pt-2">
                        <form action={async () => {
                            await logout();
                        }}>
                            <button type="submit" className="flex items-center gap-3 p-3 rounded-md text-destructive hover:bg-destructive/10 w-full text-left">
                                <LogOut size={20} />
                                Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
