-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referred_by_fkey";

-- DropIndex
DROP INDEX "User_ref_code_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "ref_code" DROP NOT NULL;
