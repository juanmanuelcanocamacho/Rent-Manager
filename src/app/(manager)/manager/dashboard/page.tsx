import { getManagerDashboardData } from '@/actions/manager-dashboard';
import { ManagerDashboardUI } from '@/components/dashboard/ManagerDashboardUI';
import { requireManagementAccess } from '@/lib/rbac';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function ManagerDashboardPage() {
    const user = await requireManagementAccess();
    
    if (user.role !== Role.MANAGER) {
        redirect('/dashboard');
    }

    const managerData = await getManagerDashboardData();
    
    return <ManagerDashboardUI data={managerData} />;
}
