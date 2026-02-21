import { Button } from "@/components/ui/shared";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/actions/auth";
import { BackButton } from "@/components/ui/back-button";
import { requireTenant } from "@/lib/rbac";
import { UserHeader } from "@/components/layout/user-header";
import { Role } from "@prisma/client";

export default async function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireTenant();

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <UserHeader user={{ email: user.email as string, role: Role.TENANT }} showLogo={true} />

            <main className="flex-1 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackButton />
                    {children}
                </div>
            </main>

            <footer className="py-6 border-t bg-background/50 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Llavia - Tu Panel de Inquilino
            </footer>
        </div>
    );
}
