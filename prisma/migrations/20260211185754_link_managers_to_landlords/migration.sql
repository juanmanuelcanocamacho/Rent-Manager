-- AlterTable
ALTER TABLE "User" ADD COLUMN     "landlordId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
