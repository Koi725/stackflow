-- User profile fields (all optional, edited self-service via /api/profile).
-- avatarUrl points at the app's own /api/avatar/<uuid> serving route.
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "age" INTEGER;
