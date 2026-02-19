-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Platform" ADD VALUE 'TIKTOK';
ALTER TYPE "Platform" ADD VALUE 'MEDIUM';
ALTER TYPE "Platform" ADD VALUE 'INSTAGRAM';
ALTER TYPE "Platform" ADD VALUE 'YOUTUBE';
ALTER TYPE "Platform" ADD VALUE 'WHATSAPP';
ALTER TYPE "Platform" ADD VALUE 'REDDIT';
