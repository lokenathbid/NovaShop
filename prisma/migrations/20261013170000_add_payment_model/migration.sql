-- AlterTable
ALTER TABLE `order` ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySignature` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `razorpayOrderId` VARCHAR(191) NOT NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `razorpaySignature` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(191) NOT NULL DEFAULT 'created',
    `method` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `idempotencyKey` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_razorpayPaymentId_key`(`razorpayPaymentId`),
    UNIQUE INDEX `Payment_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Payment_orderId_idx`(`orderId`),
    INDEX `Payment_razorpayOrderId_idx`(`razorpayOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Order_razorpayOrderId_key` ON `Order`(`razorpayOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_razorpayPaymentId_key` ON `Order`(`razorpayPaymentId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
