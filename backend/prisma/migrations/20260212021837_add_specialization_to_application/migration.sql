-- AlterTable
ALTER TABLE `application` ADD COLUMN `specializationId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Application_specializationId_idx` ON `Application`(`specializationId`);

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_specializationId_fkey` FOREIGN KEY (`specializationId`) REFERENCES `Specialization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
