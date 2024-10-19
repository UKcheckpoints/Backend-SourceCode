-- CreateEnum
CREATE TYPE "CheckpointStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "CheckpointPOI" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CheckpointStatus" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusUpdatedById" BIGINT NOT NULL,
    "comment" TEXT,

    CONSTRAINT "CheckpointPOI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointPass" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "checkpointId" BIGINT NOT NULL,
    "passed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CheckpointStatus" NOT NULL,
    "comment" TEXT,

    CONSTRAINT "CheckpointPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentById" BIGINT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_status" ON "CheckpointPOI"("status");

-- AddForeignKey
ALTER TABLE "CheckpointPOI" ADD CONSTRAINT "CheckpointPOI_statusUpdatedById_fkey" FOREIGN KEY ("statusUpdatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointPass" ADD CONSTRAINT "CheckpointPass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointPass" ADD CONSTRAINT "CheckpointPass_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "CheckpointPOI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
