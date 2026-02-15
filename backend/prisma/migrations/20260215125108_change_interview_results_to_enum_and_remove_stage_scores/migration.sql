/*
  Warnings:

  - You are about to drop the column `finalInterviewScore` on the `application` table. All the data in the column will be lost.
  - You are about to drop the column `initialInterviewScore` on the `application` table. All the data in the column will be lost.
  - You are about to alter the column `finalInterviewResult` on the `application` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(5))`.
  - You are about to alter the column `initialInterviewResult` on the `application` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(5))`.

*/
-- AlterTable
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

ALTER TABLE `Application`
    DROP COLUMN IF EXISTS `finalInterviewScore`,
    DROP COLUMN IF EXISTS `initialInterviewScore`,
    MODIFY `finalInterviewResult` ENUM('PASS', 'FAIL') NULL,
    MODIFY `initialInterviewResult` ENUM('PASS', 'FAIL') NULL;
