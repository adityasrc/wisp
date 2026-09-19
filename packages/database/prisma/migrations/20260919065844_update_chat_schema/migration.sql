/*
  Warnings:

  - The `status` column on the `ChatRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `Conversation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `ConversationMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `reason` on the `ReservedUsername` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `ReservedUsername` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ReservedUsername` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DM', 'GROUP', 'CHANNEL');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AvatarType" AS ENUM ('GENERATED', 'UPLOADED');

-- CreateEnum
CREATE TYPE "LifespanType" AS ENUM ('NORMAL', 'SENSITIVE');

-- AlterTable
ALTER TABLE "ChatRequest" ADD COLUMN     "message" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "RequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isDormant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "type",
ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'DM';

-- AlterTable
ALTER TABLE "ConversationMember" DROP COLUMN "role",
ADD COLUMN     "role" "ConversationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "lifespan" "LifespanType" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "ReservedUsername" DROP COLUMN "reason",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarType" "AvatarType" NOT NULL DEFAULT 'GENERATED',
ADD COLUMN     "avatarUrl" TEXT;

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "Status";

-- DropEnum
DROP TYPE "Type";

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReservedUsername" ADD CONSTRAINT "ReservedUsername_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
