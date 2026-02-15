-- AlterTable
ALTER TABLE `application` ADD COLUMN `demoFeedback` TEXT NULL,
    ADD COLUMN `finalInterviewFeedback` TEXT NULL,
    ADD COLUMN `finalInterviewResult` BOOLEAN NULL,
    ADD COLUMN `finalInterviewScore` DOUBLE NULL,
    ADD COLUMN `initialInterviewFeedback` TEXT NULL,
    ADD COLUMN `initialInterviewResult` BOOLEAN NULL,
    ADD COLUMN `initialInterviewScore` DOUBLE NULL;
