-- AlterTable
ALTER TABLE `application` ADD COLUMN `educationalBackground` TEXT NULL,
    ADD COLUMN `motivation` TEXT NULL,
    ADD COLUMN `program` VARCHAR(191) NULL,
    ADD COLUMN `subjectSpecialization` VARCHAR(191) NULL,
    ADD COLUMN `teachingExperience` TEXT NULL;
