-- AlterTable
ALTER TABLE `application` ADD COLUMN `instructorAttributesScore` DOUBLE NULL,
    ADD COLUMN `knowledgeOfSubjectScore` DOUBLE NULL,
    ADD COLUMN `studentLearningActionsScore` DOUBLE NULL,
    ADD COLUMN `teachingMethodScore` DOUBLE NULL;
