-- Add stage-specific interview scheduling fields
ALTER TABLE `application`
  ADD COLUMN `initialInterviewSchedule` DATETIME NULL,
  ADD COLUMN `initialInterviewRescheduleCount` INT NOT NULL DEFAULT 0,
  ADD COLUMN `initialInterviewRescheduleReason` VARCHAR(191) NULL,
  ADD COLUMN `finalInterviewSchedule` DATETIME NULL,
  ADD COLUMN `finalInterviewRescheduleCount` INT NOT NULL DEFAULT 0,
  ADD COLUMN `finalInterviewRescheduleReason` VARCHAR(191) NULL;

-- Migrate existing single interview schedule into the initial stage fields
UPDATE `application`
SET `initialInterviewSchedule` = `interviewSchedule`,
    `initialInterviewRescheduleCount` = IFNULL(`interviewRescheduleCount`, 0),
    `initialInterviewRescheduleReason` = `interviewRescheduleReason`
WHERE `interviewSchedule` IS NOT NULL;

-- Drop legacy single-stage interview scheduling columns
ALTER TABLE `application`
  DROP COLUMN IF EXISTS `interviewSchedule`,
  DROP COLUMN IF EXISTS `interviewRescheduleCount`,
  DROP COLUMN IF EXISTS `interviewRescheduleReason`;
