'use client';

import { UserCircle, LogOut, Shield, Settings, ChevronDown } from 'lucide-react';
import { logout } from '@/actions/auth';
import { Role } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

interface UserHeaderProps {
    user: {
        email: string;
        role: Role;
    };
    showLogo?: boolean;
}

export function UserHeader({ user, showLogo }: UserHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const roleLabel =
        user.role === Role.LANDLORD ? 'Propietario' :
            user.role === Role.MANAGER ? 'Gestor' : 'Inquilino';

    const settingsPath = user.role === Role.TENANT ? '/me/settings' : '/settings';

    const toggleMenu = () => {
        console.log('Menu toggled, new state:', !isOpen);
        setIsOpen(!isOpen);
    };

    return (
        <div className="bg-card border-b px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
            <div className="flex items-center gap-2">
                {showLogo && (
                    <>
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="text-white font-bold text-lg">G</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline">Gestión Alquiler</span>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-foreground leading-none">{user.email}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1">
                        <Shield size={10} className="text-primary" />
                        {roleLabel}
                    </span>
                </div>

                {/* User Menu Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={toggleMenu}
                        className="flex items-center gap-2 hover:bg-accent/50 rounded-lg p-2 transition-colors cursor-pointer"
                    >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <UserCircle size={24} />
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <>
                            {/* Backdrop to close menu */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsOpen(false)}
                            />

                            <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                                <Link
                                    href={settingsPath}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-sm cursor-pointer"
                                >
                                    <Settings size={18} className="text-muted-foreground" />
                                    <span>Configuración</span>
                                </Link>

                                <div className="border-t" />

                                <form action={async () => {
                                    await logout();
                                }}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors text-sm text-destructive cursor-pointer"
                                    >
                                        <LogOut size={18} />
                                        <span>Cerrar sesión</span>
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
