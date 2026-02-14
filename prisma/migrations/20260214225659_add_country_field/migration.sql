-- CreateEnum
CREATE TYPE "Country" AS ENUM ('SPAIN', 'BOLIVIA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'BOLIVIA';
