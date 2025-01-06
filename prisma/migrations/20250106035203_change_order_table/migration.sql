/*
  Warnings:

  - You are about to drop the column `redirect_url` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `Order_Details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Order_Details` table. All the data in the column will be lost.
  - You are about to drop the column `isRedeem` on the `User_Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `User_Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `isRedeem` on the `User_Point` table. All the data in the column will be lost.
  - Added the required column `subtotal` to the `Order_Details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "redirect_url",
ADD COLUMN     "coupon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "point" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order_Details" DROP CONSTRAINT "Order_Details_pkey",
DROP COLUMN "id",
ADD COLUMN     "subtotal" INTEGER NOT NULL,
ADD CONSTRAINT "Order_Details_pkey" PRIMARY KEY ("orderId", "ticketId");

-- AlterTable
ALTER TABLE "User_Coupon" DROP COLUMN "isRedeem",
DROP COLUMN "percentage",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User_Point" DROP COLUMN "isRedeem",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
