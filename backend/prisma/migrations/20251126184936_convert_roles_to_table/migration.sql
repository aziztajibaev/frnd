-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default roles
INSERT INTO "roles" ("name", "createdAt", "updatedAt") VALUES
    ('USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MODERATOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('SUPER_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrate existing user roles to the new structure
INSERT INTO "user_roles" ("userId", "roleId", "createdAt")
SELECT
    u."id" as "userId",
    r."id" as "roleId",
    CURRENT_TIMESTAMP as "createdAt"
FROM "users" u
JOIN "roles" r ON r."name" = u."role"::text;

-- DropColumn role from users
ALTER TABLE "users" DROP COLUMN "role";

-- DropEnum Role
DROP TYPE "Role";
