/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "slug" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
