-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER', 'FRIEND');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "free_date" TIMESTAMP(3),
    "interval" TEXT,
    "is_subscribed" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer" TEXT,
    "free_end" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_username" ON "User"("username");

-- CreateIndex
CREATE INDEX "idx_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_role_subscription" ON "User"("role", "is_subscribed");
