-- Convert existing boolean/tinyint values to enum text before altering columns
UPDATE `Application`
SET `initialInterviewResult` = CASE
  WHEN `initialInterviewResult` = 1 THEN 'PASS'
  WHEN `initialInterviewResult` = 0 THEN 'FAIL'
  WHEN `initialInterviewResult` IS NULL THEN NULL
  ELSE `initialInterviewResult`
END;

UPDATE `Application`
SET `finalInterviewResult` = CASE
  WHEN `finalInterviewResult` = 1 THEN 'PASS'
  WHEN `finalInterviewResult` = 0 THEN 'FAIL'
  WHEN `finalInterviewResult` IS NULL THEN NULL
  ELSE `finalInterviewResult`
END;

-- Drop obsolete score columns
ALTER TABLE `Application`
  DROP COLUMN IF EXISTS `initialInterviewScore`,
  DROP COLUMN IF EXISTS `finalInterviewScore`;

-- Alter result columns to enum
ALTER TABLE `Application`
  MODIFY `initialInterviewResult` ENUM('PASS','FAIL') NULL,
  MODIFY `finalInterviewResult` ENUM('PASS','FAIL') NULL;
