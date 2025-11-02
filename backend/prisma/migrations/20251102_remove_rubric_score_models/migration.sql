-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `score_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `score` DROP FOREIGN KEY `score_rubricId_fkey`;

-- DropTable
DROP TABLE `score`;

-- DropTable
DROP TABLE `rubric`;
