-- AlterTable
ALTER TABLE `application` ADD COLUMN `demoDuration` INTEGER NULL,
    ADD COLUMN `demoLocation` VARCHAR(191) NULL,
    ADD COLUMN `demoNotes` TEXT NULL;
