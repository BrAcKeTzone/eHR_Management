-- AlterTable
ALTER TABLE `notification` ADD COLUMN `status` ENUM('UNREAD', 'READ') NOT NULL DEFAULT 'UNREAD';

-- CreateIndex
CREATE INDEX `Notification_status_idx` ON `Notification`(`status`);
