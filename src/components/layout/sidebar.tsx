'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shared';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    CreditCard,
    MessageSquare,
    TrendingDown,
    LogOut,
    UserCog,
    Shield
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { Role } from '@prisma/client';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/rooms', label: 'Propiedades', icon: Building2 },
    { href: '/tenants', label: 'Inquilinos', icon: Users },
    { href: '/leases', label: 'Contratos', icon: FileText },
    { href: '/invoices', label: 'Facturación', icon: CreditCard },
    { href: '/expenses', label: 'Gastos', icon: TrendingDown },
    { href: '/reports', label: 'Reportes', icon: MessageSquare },
];

interface SidebarProps {
    notificationCounts?: {
        reports: number;
    };
    userRole?: Role;
    user?: {
        email: string;
        role: Role;
    };
}

export function Sidebar({ notificationCounts, userRole, user }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Llavia
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

                {/* Team Link - Landlord Only */}
                {userRole === 'LANDLORD' && (
                    <Button
                        variant={pathname === '/team' ? 'secondary' : 'ghost'}
                        className={cn(
                            "w-full justify-start gap-3 relative",
                            pathname === '/team' && "bg-secondary font-medium"
                        )}
                        asChild
                    >
                        <Link href="/team">
                            <Users size={20} />
                            Equipo
                        </Link>
                    </Button>
                )}
            </nav>

            <div className="p-4 border-t mt-auto">
                {user && (
                    <div className="mb-4 px-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Users size={20} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold truncate" title={user.email}>
                                    {user.email}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                                    <Shield size={10} />
                                    {user.role === 'LANDLORD' ? 'PROPIETARIO' : user.role === 'MANAGER' ? 'GESTOR' : 'INQUILINO'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

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

export function MobileHeader({ userRole, user }: { userRole?: Role; user?: { email: string; role: Role } }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="md:hidden border-b bg-card sticky top-0 z-50">
            <div className="p-4 flex items-center justify-between bg-card">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Llavia
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

                    <div className="border-t my-2 pt-2 pb-2">
                        {user && (
                            <div className="flex items-center gap-3 px-3 py-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs border border-primary/20">
                                    <Users size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.email}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{user.role}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {userRole === 'LANDLORD' && (
                        <Link
                            href="/team"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-md transition-colors",
                                pathname === '/team' ? "bg-secondary font-medium" : "hover:bg-muted"
                            )}
                        >
                            <Users size={20} />
                            Equipo
                        </Link>
                    )}

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
