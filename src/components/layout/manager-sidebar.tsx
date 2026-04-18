'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shared';
import {
    LayoutDashboard,
    CreditCard,
    TrendingDown,
    LogOut,
    Menu,
    X,
    Shield,
    Users,
    FileText,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const managerNavItems = [
    { href: '/manager/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/manager/invoices', label: 'Cobros', icon: CreditCard },
    { href: '/manager/expenses', label: 'Gastos', icon: TrendingDown },
    { href: '/manager/tenants', label: 'Inquilinos', icon: Users },
    { href: '/manager/leases', label: 'Contratos', icon: FileText },
];

interface ManagerSidebarProps {
    user: {
        email?: string | null;
        name?: string | null;
        username?: string | null;
    };
}

export function ManagerSidebar({ user }: ManagerSidebarProps) {
    const pathname = usePathname();
    const displayName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Encargado');

    return (
        <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col hidden md:flex">
            <div className="p-6 border-b">
                <Link href="/manager/dashboard">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Llavia <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Encargado</span>
                    </h1>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {managerNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                                "w-full justify-start gap-4 relative py-6 rounded-2xl",
                                isActive && "bg-primary/10 text-primary font-bold shadow-sm"
                            )}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon size={22} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </nav>

            <div className="p-4 border-t mt-auto">
                <div className="mb-4 px-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Shield size={20} />
                            </div>
                            <div className="flex flex-col overflow-hidden max-w-[100px]">
                                <span className="text-sm font-semibold truncate" title={user.email || user.username || 'Encargado'}>
                                    {displayName}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">ENCARGADO</span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

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

export function ManagerMobileHeader({ user }: { user: { email?: string | null, name?: string | null, username?: string | null } }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const displayName = user.name || user.username || user.email || 'Encargado';

    return (
        <header className="md:hidden border-b bg-card sticky top-0 z-50">
            <div className="p-4 flex items-center justify-between">
                <Link href="/manager/dashboard">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Llavia <span className="text-[10px] text-muted-foreground font-medium">ENCARGADO</span>
                    </h1>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 fade-in-20 duration-300">
                    {managerNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                                    isActive ? "bg-primary text-primary-foreground font-bold shadow-md" : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <item.icon size={24} />
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="border-t my-2 pt-4 px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Shield size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold truncate max-w-[200px]">{displayName}</span>
                                <span className="text-[10px] text-muted-foreground font-bold">PERFIL ENCARGADO</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t mt-2 pt-2">
                        <form action={async () => {
                            await logout();
                        }}>
                            <button type="submit" className="flex items-center gap-4 p-4 rounded-xl text-destructive hover:bg-destructive/10 w-full text-left font-medium">
                                <LogOut size={24} />
                                Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </header>
    );
}
