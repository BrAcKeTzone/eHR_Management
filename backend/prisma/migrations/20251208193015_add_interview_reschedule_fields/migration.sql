-- AlterTable
ALTER TABLE `application` ADD COLUMN `interviewRescheduleCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `interviewRescheduleReason` VARCHAR(191) NULL;
