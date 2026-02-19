-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('APPLICANT', 'HR', 'ADMIN') NOT NULL DEFAULT 'APPLICANT',
    `profilePicture` VARCHAR(191) NULL,
    `profilePicturePublicId` VARCHAR(191) NULL,
    `civilStatus` VARCHAR(191) NULL,
    `houseNo` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `barangay` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `education` LONGTEXT NULL,
    `references` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attemptNumber` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PENDING', 'ACKNOWLEDGED', 'FOR_EVALUATION', 'APPROVED', 'REJECTED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `documents` LONGTEXT NULL,
    `demoSchedule` DATETIME(3) NULL,
    `demoLocation` VARCHAR(191) NULL,
    `demoDuration` INTEGER NULL,
    `demoNotes` TEXT NULL,
    `demoRescheduleCount` INTEGER NOT NULL DEFAULT 0,
    `demoRescheduleReason` VARCHAR(191) NULL,
    `interviewEligible` BOOLEAN NOT NULL DEFAULT false,
    `initialInterviewSchedule` DATETIME(3) NULL,
    `initialInterviewRescheduleCount` INTEGER NOT NULL DEFAULT 0,
    `initialInterviewRescheduleReason` VARCHAR(191) NULL,
    `finalInterviewSchedule` DATETIME(3) NULL,
    `finalInterviewRescheduleCount` INTEGER NOT NULL DEFAULT 0,
    `finalInterviewRescheduleReason` VARCHAR(191) NULL,
    `studentLearningActionsScore` DOUBLE NULL,
    `knowledgeOfSubjectScore` DOUBLE NULL,
    `teachingMethodScore` DOUBLE NULL,
    `instructorAttributesScore` DOUBLE NULL,
    `demoFeedback` TEXT NULL,
    `initialInterviewResult` ENUM('PASS', 'FAIL') NULL,
    `initialInterviewFeedback` TEXT NULL,
    `finalInterviewResult` ENUM('PASS', 'FAIL') NULL,
    `finalInterviewFeedback` TEXT NULL,
    `interviewScore` DOUBLE NULL,
    `interviewResult` ENUM('PASS', 'FAIL') NULL,
    `interviewNotes` TEXT NULL,
    `totalScore` DOUBLE NULL,
    `result` ENUM('PASS', 'FAIL') NULL,
    `hrNotes` TEXT NULL,
    `applicantId` INTEGER NOT NULL,
    `specializationId` INTEGER NULL,
    `program` VARCHAR(191) NULL,
    `subjectSpecialization` VARCHAR(191) NULL,
    `educationalBackground` TEXT NULL,
    `teachingExperience` TEXT NULL,
    `motivation` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Application_applicantId_attemptNumber_idx`(`applicantId`, `attemptNumber`),
    INDEX `Application_specializationId_idx`(`specializationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` ENUM('UNREAD', 'READ') NOT NULL DEFAULT 'UNREAD',
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applicationId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_email_idx`(`email`),
    INDEX `Notification_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Otp_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Specialization_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PreEmploymentRequirement` ADD CONSTRAINT `PreEmploymentRequirement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_specializationId_fkey` FOREIGN KEY (`specializationId`) REFERENCES `Specialization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
