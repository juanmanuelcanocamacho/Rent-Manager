import { requireManagementAccess } from '@/lib/rbac';
import { db } from '@/lib/db';
import ProfileForm from '@/components/profile/profile-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mi Perfil | Llavia',
    description: 'Gestiona tu información personal y configuración de cuenta.',
};

export default async function ProfilePage() {
    const sessionUser = await requireManagementAccess();
    
    const user = await db.user.findUnique({
        where: { id: sessionUser.id },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            phone: true,
            country: true,
            role: true,
            documentNumber: true,
            documentIssuedIn: true,
            maritalStatus: true,
            legalAddress: true,
        }
    });
    
    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground text-lg font-medium">
                    Gestiona tus datos personales y configuración de administrador.
                </p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
