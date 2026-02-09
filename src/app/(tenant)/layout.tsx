import { Button } from "@/components/ui/shared";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/actions/auth";
import { BackButton } from "@/components/ui/back-button";

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            {/* Simple Top Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Gestión Alquiler</span>
                    </div>

                    <form action={logout}>
                        <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground hover:text-destructive">
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </Button>
                    </form>
                </div>
            </header>

            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackButton />
                    {children}
                </div>
            </main>

            <footer className="py-6 border-t bg-background/50 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Gestión Alquiler - Tu Panel de Inquilino
            </footer>
        </div>
    );
}
