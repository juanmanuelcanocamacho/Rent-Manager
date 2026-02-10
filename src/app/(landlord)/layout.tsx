import { MobileHeader, Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { requireManagementAccess } from "@/lib/rbac";
import { Role } from "@prisma/client";

export default async function LandlordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireManagementAccess();
    const role = user.role as Role;

    return (
        <div className="flex min-h-screen">
            <Sidebar userRole={role} />
            <div className="flex-1 flex flex-col">
                <MobileHeader userRole={role} />
                <main className="flex-1 p-6 md:p-8 bg-muted/20">
                    <div className="mx-auto max-w-6xl">
                        <BackButton />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
