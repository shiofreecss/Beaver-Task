-- AlterTable
ALTER TABLE "Project" ADD COLUMN "categories" TEXT DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "documents" TEXT DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "website" TEXT;
