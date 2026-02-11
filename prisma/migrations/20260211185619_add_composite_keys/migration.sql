/*
  Warnings:

  - A unique constraint covering the columns `[id,landlordId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,landlordId]` on the table `Lease` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,landlordId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,landlordId]` on the table `TenantProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "landlordId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "landlordId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "landlordId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TenantProfile" ALTER COLUMN "landlordId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_id_landlordId_key" ON "Expense"("id", "landlordId");

-- CreateIndex
CREATE UNIQUE INDEX "Lease_id_landlordId_key" ON "Lease"("id", "landlordId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_landlordId_key" ON "Room"("id", "landlordId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProfile_id_landlordId_key" ON "TenantProfile"("id", "landlordId");
