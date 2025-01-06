-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('active', 'finish');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" DEFAULT 'active';
