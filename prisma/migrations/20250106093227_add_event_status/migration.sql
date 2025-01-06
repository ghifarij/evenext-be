-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'finish');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'active';
