import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@rentmanager.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            role: Role.LANDLORD,
        },
    });

    console.log(`Created admin user: ${admin.email}`);

    // Optional: Demo data
    if (process.env.SEED_DEMO === 'true') {
        // Create a Tenant
        const tenantEmail = 'tenant@demo.com';
        const tenantUser = await prisma.user.upsert({
            where: { email: tenantEmail },
            update: {},
            create: {
                email: tenantEmail,
                passwordHash: await bcrypt.hash('tenant123', 10),
                role: Role.TENANT,
                tenantProfile: {
                    create: {
                        fullName: "Juan Tenant",
                        phoneE164: "+34600000000",
                        whatsappOptIn: true,
                        notes: "Buen pagador"
                    }
                }
            }
        });

        // Create a Room
        const room = await prisma.room.create({
            data: {
                name: "Habitación 101 - Principal",
                status: "AVAILABLE" // Will be updated by Lease creation usually, but here we manually set
            }
        });

        console.log('Created demo tenant and room');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
