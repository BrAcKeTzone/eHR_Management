-- AlterTable
ALTER TABLE `application` ADD COLUMN `interviewNotes` TEXT NULL,
    ADD COLUMN `interviewResult` ENUM('PASS', 'FAIL') NULL,
    ADD COLUMN `interviewScore` DOUBLE NULL;
