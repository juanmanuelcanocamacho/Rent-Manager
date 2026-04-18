import { ManagerMobileHeader, ManagerSidebar } from "@/components/layout/manager-sidebar";
import { BackButton } from "@/components/ui/back-button";
import { requireManagementAccess } from "@/lib/rbac";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireManagementAccess();
    
    // Safety check - force Landlords out of Manager layout just in case
    if (user.role === Role.LANDLORD) {
        redirect('/dashboard');
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
            <ManagerSidebar user={{ email: user.email as string }} />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <ManagerMobileHeader user={{ email: user.email as string }} />
                <main className="flex-1 p-4 md:p-8 lg:p-12 w-full overflow-x-hidden">
                    <div className="mx-auto max-w-4xl w-full">
                        <BackButton />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
