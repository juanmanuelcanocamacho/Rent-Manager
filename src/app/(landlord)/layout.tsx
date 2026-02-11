import { MobileHeader, Sidebar } from "@/components/layout/sidebar";
// import { UserHeader } from "@/components/layout/user-header"; // Removed as per request
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
            <Sidebar userRole={role} user={{ email: user.email as string, role }} />
            <div className="flex-1 flex flex-col">
                <MobileHeader userRole={role} user={{ email: user.email as string, role }} />
                {/* <UserHeader user={{ email: user.email as string, role }} /> */}
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
