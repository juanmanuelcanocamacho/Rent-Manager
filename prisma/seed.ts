
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            role: 'LANDLORD',
        },
    });

    console.log({ user });

    // Seed Tenant
    const tenantEmail = 'tenant@test.com';
    const tenantPwd = await bcrypt.hash('tenant123', 10);
    const tenantUser = await prisma.user.upsert({
        where: { email: tenantEmail },
        update: {},
        create: {
            email: tenantEmail,
            passwordHash: tenantPwd,
            role: 'TENANT',
        }
    });

    const tenantProfile = await prisma.tenantProfile.upsert({
        where: { userId: tenantUser.id },
        update: {},
        create: {
            userId: tenantUser.id,
            fullName: "Inquilino De Prueba",
            documentNumber: "12345678A",
        }
    });

    // Seed Room
    // Check if exists first to avoid duplicates since name isn't unique
    let room = await prisma.room.findFirst({ where: { name: "Habitación 101" } });
    if (!room) {
        room = await prisma.room.create({
            data: {
                name: "Habitación 101",
                status: 'OCCUPIED',
            }
        });
    }

    // Seed Lease
    const lease = await prisma.lease.create({
        data: {
            rooms: { connect: { id: room.id } },
            tenantId: tenantProfile.id,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 11)), // 11 months from now
            rentAmountCents: 50000,
            status: 'ACTIVE',
            billingDay: 1,
        }
    });

    // Seed Invoice
    await prisma.invoice.create({
        data: {
            leaseId: lease.id,
            dueDate: new Date(), // Today
            amountCents: 50000,
            status: 'PENDING',
        }
    });

    console.log("Seeded Tenant, Room, Lease, Invoice");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
