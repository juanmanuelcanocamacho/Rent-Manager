'use client';

import { UserCircle, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/shared';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/actions/auth';
import { Role } from '@prisma/client';

interface UserHeaderProps {
    user: {
        email: string;
        role: Role;
    };
    showLogo?: boolean;
}

export function UserHeader({ user, showLogo }: UserHeaderProps) {
    const roleLabel =
        user.role === Role.LANDLORD ? 'Propietario' :
            user.role === Role.MANAGER ? 'Gestor' : 'Inquilino';

    return (
        <div className="bg-card border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-2">
                {showLogo && (
                    <>
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline">Llavia</span>
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
                <ThemeToggle />
                <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-foreground leading-none">{user.email}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1">
                        <Shield size={10} className="text-primary" />
                        {roleLabel}
                    </span>
                </div>

                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <UserCircle size={24} />
                </div>

                <div className="h-6 w-[1px] bg-border mx-2" />

                <form action={async () => {
                    await logout();
                }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </Button>
                </form>
            </div>
        </div>
    );
}
