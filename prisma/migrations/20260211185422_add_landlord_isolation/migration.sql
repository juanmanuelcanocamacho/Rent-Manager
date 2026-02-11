-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "landlordId" TEXT NOT NULL DEFAULT 'cmlff86gm0000sx347maitxxf';

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "landlordId" TEXT NOT NULL DEFAULT 'cmlff86gm0000sx347maitxxf';

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "landlordId" TEXT NOT NULL DEFAULT 'cmlff86gm0000sx347maitxxf';

-- AlterTable
ALTER TABLE "TenantProfile" ADD COLUMN     "landlordId" TEXT NOT NULL DEFAULT 'cmlff86gm0000sx347maitxxf';

-- AddForeignKey
ALTER TABLE "TenantProfile" ADD CONSTRAINT "TenantProfile_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
