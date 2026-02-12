-- CreateTable
CREATE TABLE `PreEmploymentRequirement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sss` VARCHAR(191) NULL,
    `philhealth` VARCHAR(191) NULL,
    `tin` VARCHAR(191) NULL,
    `pagibig` VARCHAR(191) NULL,
    `photo2x2` VARCHAR(191) NULL,
    `coe` VARCHAR(191) NULL,
    `marriageContract` VARCHAR(191) NULL,
    `prcLicense` VARCHAR(191) NULL,
    `civilService` VARCHAR(191) NULL,
    `mastersUnits` VARCHAR(191) NULL,
    `car` VARCHAR(191) NULL,
    `tor` VARCHAR(191) NULL,
    `otherCert` VARCHAR(191) NULL,
    `tesdaCerts` LONGTEXT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PreEmploymentRequirement_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreEmploymentRequirement` ADD CONSTRAINT `PreEmploymentRequirement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
