-- KuberOne Enterprise SMS Infrastructure

CREATE TABLE `sms_providers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provider_type` ENUM('MSG91', 'TWILIO', 'AWS_SNS', 'MOCK') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `rate_limit` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `sms_providers_code_key`(`code`),
    INDEX `sms_providers_is_active_is_default_idx`(`is_active`, `is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `category` ENUM('OTP', 'TRANSACTIONAL', 'SUPPORT', 'COMPLIANCE', 'MARKETING') NOT NULL DEFAULT 'TRANSACTIONAL',
    `event_type` VARCHAR(50) NULL,
    `body` VARCHAR(1000) NOT NULL,
    `dlt_template_id` VARCHAR(50) NULL,
    `variables` JSON NOT NULL,
    `locale` VARCHAR(10) NOT NULL DEFAULT 'en',
    `current_version` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    UNIQUE INDEX `sms_templates_code_key`(`code`),
    INDEX `sms_templates_category_is_active_idx`(`category`, `is_active`),
    INDEX `sms_templates_event_type_is_active_idx`(`event_type`, `is_active`),
    INDEX `sms_templates_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_template_versions` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `body` VARCHAR(1000) NOT NULL,
    `dlt_template_id` VARCHAR(50) NULL,
    `variables` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,
    UNIQUE INDEX `sms_template_versions_template_id_version_key`(`template_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_queue` (
    `id` CHAR(36) NOT NULL,
    `queue_type` ENUM('NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED', 'OTP') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `to_phone` VARCHAR(15) NOT NULL,
    `recipient_user_id` CHAR(36) NULL,
    `template_id` CHAR(36) NULL,
    `template_code` VARCHAR(80) NULL,
    `body` VARCHAR(1000) NULL,
    `variables` JSON NULL,
    `payload` JSON NULL,
    `provider_id` CHAR(36) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `processed_at` DATETIME(3) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` VARCHAR(500) NULL,
    `sms_log_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `sms_queue_status_priority_scheduled_at_idx`(`status`, `priority`, `scheduled_at`),
    INDEX `sms_queue_queue_type_status_idx`(`queue_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_deliveries` (
    `id` CHAR(36) NOT NULL,
    `sms_log_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NULL,
    `template_id` CHAR(36) NULL,
    `status` ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED', 'REJECTED') NOT NULL DEFAULT 'QUEUED',
    `provider_ref` VARCHAR(200) NULL,
    `is_otp` BOOLEAN NOT NULL DEFAULT false,
    `otp_purpose` VARCHAR(30) NULL,
    `queued_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `expired_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `sms_deliveries_sms_log_id_key`(`sms_log_id`),
    INDEX `sms_deliveries_status_created_at_idx`(`status`, `created_at`),
    INDEX `sms_deliveries_provider_ref_idx`(`provider_ref`),
    INDEX `sms_deliveries_is_otp_otp_purpose_idx`(`is_otp`, `otp_purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_events` (
    `id` CHAR(36) NOT NULL,
    `delivery_id` CHAR(36) NOT NULL,
    `event_type` ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED', 'REJECTED', 'BOUNCED', 'DEFERRED') NOT NULL,
    `metadata` JSON NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `sms_events_delivery_id_occurred_at_idx`(`delivery_id`, `occurred_at`),
    INDEX `sms_events_event_type_idx`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_preferences` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `category` ENUM('OTP', 'TRANSACTIONAL', 'SUPPORT', 'COMPLIANCE', 'MARKETING') NULL,
    `event_type` VARCHAR(50) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `sms_preferences_user_id_category_event_type_key`(`user_id`, `category`, `event_type`),
    INDEX `sms_preferences_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sms_analytics` (
    `id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `template_id` CHAR(36) NULL,
    `category` ENUM('OTP', 'TRANSACTIONAL', 'SUPPORT', 'COMPLIANCE', 'MARKETING') NULL,
    `provider_id` CHAR(36) NULL,
    `sent_count` INTEGER NOT NULL DEFAULT 0,
    `delivered_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `rejected_count` INTEGER NOT NULL DEFAULT 0,
    `otp_sent_count` INTEGER NOT NULL DEFAULT 0,
    `otp_verified_count` INTEGER NOT NULL DEFAULT 0,
    `otp_failed_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `sms_analytics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `sms_templates` ADD CONSTRAINT `sms_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_templates` ADD CONSTRAINT `sms_templates_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_template_versions` ADD CONSTRAINT `sms_template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `sms_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sms_template_versions` ADD CONSTRAINT `sms_template_versions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_queue` ADD CONSTRAINT `sms_queue_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `sms_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_queue` ADD CONSTRAINT `sms_queue_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `sms_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_queue` ADD CONSTRAINT `sms_queue_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_deliveries` ADD CONSTRAINT `sms_deliveries_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `sms_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sms_events` ADD CONSTRAINT `sms_events_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `sms_deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sms_preferences` ADD CONSTRAINT `sms_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sms_analytics` ADD CONSTRAINT `sms_analytics_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `sms_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
