/*
  Warnings:

  - A unique constraint covering the columns `[ref_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referred_by" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_ref_code_key" ON "User"("ref_code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
