import { PrismaClient } from '@prisma/client';

// Use localhost for running from the host machine, assuming port 5432 is exposed
// encoded password from user's .env: V9x%213Qp%237Lm%402Zr%245Tn%5E8Wk%264Hj%2A6Cq
const databaseUrl = "postgresql://postgres:V9x%213Qp%237Lm%402Zr%245Tn%5E8Wk%264Hj%2A6Cq@localhost:5432/rentmanager?schema=public";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    console.log("Checking for admin user...");
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin' },
        });

        if (user) {
            console.log('✅ User found:', {
                id: user.id,
                email: user.email,
                role: user.role,
                passwordHashPrefix: user.passwordHash.substring(0, 10) + '...'
            });
        } else {
            console.log('❌ User "admin" NOT found.');
        }
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
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
