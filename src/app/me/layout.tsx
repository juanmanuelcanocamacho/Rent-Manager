import Link from 'next/link';
import {
    Home,
    CreditCard,
    MessageSquare,
    LogOut
} from 'lucide-react';
import { signOut } from '@/lib/auth';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/20">
            {/* Navbar */}
            <nav className="bg-card border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <span className="text-xl font-bold text-primary">Mi Espacio</span>

                            <div className="hidden md:flex space-x-4">
                                <Link href="/me" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
                                    <Home size={18} /> Resumen
                                </Link>
                                <Link href="/me/invoices" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
                                    <CreditCard size={18} /> Facturas
                                </Link>
                                <Link href="/me/messages" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
                                    <MessageSquare size={18} /> Ayuda
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/login' });
                            }}>
                                <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
