/*
  Warnings:

  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `landmark` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'Home',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- RenameIndex
ALTER TABLE `address` RENAME INDEX `Address_userId_fkey` TO `Address_userId_idx`;
