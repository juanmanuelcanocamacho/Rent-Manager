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
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar userRole={role} user={{ email: user.email as string, role }} />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <MobileHeader userRole={role} user={{ email: user.email as string, role }} />
                {/* <UserHeader user={{ email: user.email as string, role }} /> */}
                <main className="flex-1 p-2 md:p-6 lg:p-8 bg-muted/20 w-full overflow-x-hidden overflow-y-auto">
                    <div className="mx-auto max-w-full md:max-w-6xl w-full">
                        <BackButton />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
