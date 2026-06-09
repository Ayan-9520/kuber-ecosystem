-- KuberOne Enterprise Email Infrastructure

CREATE TABLE `email_providers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provider_type` ENUM('SMTP', 'SENDGRID', 'AWS_SES', 'MOCK') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `rate_limit` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `email_providers_code_key`(`code`),
    INDEX `email_providers_is_active_is_default_idx`(`is_active`, `is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `category` ENUM('TRANSACTIONAL', 'MARKETING', 'SYSTEM', 'SUPPORT', 'COMPLIANCE') NOT NULL DEFAULT 'TRANSACTIONAL',
    `event_type` VARCHAR(50) NULL,
    `subject` VARCHAR(500) NOT NULL,
    `html_body` LONGTEXT NOT NULL,
    `text_body` TEXT NULL,
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
    UNIQUE INDEX `email_templates_code_key`(`code`),
    INDEX `email_templates_category_is_active_idx`(`category`, `is_active`),
    INDEX `email_templates_event_type_is_active_idx`(`event_type`, `is_active`),
    INDEX `email_templates_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_template_versions` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `html_body` LONGTEXT NOT NULL,
    `text_body` TEXT NULL,
    `variables` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,
    UNIQUE INDEX `email_template_versions_template_id_version_key`(`template_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_queue` (
    `id` CHAR(36) NOT NULL,
    `queue_type` ENUM('NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `to_email` VARCHAR(255) NOT NULL,
    `recipient_user_id` CHAR(36) NULL,
    `template_id` CHAR(36) NULL,
    `template_code` VARCHAR(80) NULL,
    `subject` VARCHAR(500) NULL,
    `html_body` LONGTEXT NULL,
    `text_body` TEXT NULL,
    `variables` JSON NULL,
    `payload` JSON NULL,
    `provider_id` CHAR(36) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `processed_at` DATETIME(3) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` VARCHAR(500) NULL,
    `email_log_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `email_queue_status_priority_scheduled_at_idx`(`status`, `priority`, `scheduled_at`),
    INDEX `email_queue_queue_type_status_idx`(`queue_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_deliveries` (
    `id` CHAR(36) NOT NULL,
    `email_log_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NULL,
    `template_id` CHAR(36) NULL,
    `status` ENUM('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED') NOT NULL DEFAULT 'QUEUED',
    `provider_ref` VARCHAR(200) NULL,
    `queued_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `opened_at` DATETIME(3) NULL,
    `clicked_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `bounced_at` DATETIME(3) NULL,
    `unsubscribed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `email_deliveries_email_log_id_key`(`email_log_id`),
    INDEX `email_deliveries_status_created_at_idx`(`status`, `created_at`),
    INDEX `email_deliveries_provider_ref_idx`(`provider_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_events` (
    `id` CHAR(36) NOT NULL,
    `delivery_id` CHAR(36) NOT NULL,
    `event_type` ENUM('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED', 'DEFERRED') NOT NULL,
    `metadata` JSON NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `email_events_delivery_id_occurred_at_idx`(`delivery_id`, `occurred_at`),
    INDEX `email_events_event_type_idx`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_attachments` (
    `id` CHAR(36) NOT NULL,
    `delivery_id` CHAR(36) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `content_type` VARCHAR(100) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `storage_key` VARCHAR(500) NOT NULL,
    `checksum` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `email_attachments_delivery_id_idx`(`delivery_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_preferences` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `category` ENUM('TRANSACTIONAL', 'MARKETING', 'SYSTEM', 'SUPPORT', 'COMPLIANCE') NULL,
    `event_type` VARCHAR(50) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,
    `unsubscribed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `email_preferences_user_id_category_event_type_key`(`user_id`, `category`, `event_type`),
    INDEX `email_preferences_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `email_analytics` (
    `id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `template_id` CHAR(36) NULL,
    `category` ENUM('TRANSACTIONAL', 'MARKETING', 'SYSTEM', 'SUPPORT', 'COMPLIANCE') NULL,
    `campaign_id` CHAR(36) NULL,
    `sent_count` INTEGER NOT NULL DEFAULT 0,
    `delivered_count` INTEGER NOT NULL DEFAULT 0,
    `opened_count` INTEGER NOT NULL DEFAULT 0,
    `clicked_count` INTEGER NOT NULL DEFAULT 0,
    `bounced_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `unsubscribed_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `email_analytics_date_template_id_category_campaign_id_key`(`date`, `template_id`, `category`, `campaign_id`),
    INDEX `email_analytics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_templates` ADD CONSTRAINT `email_templates_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_template_versions` ADD CONSTRAINT `email_template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `email_template_versions` ADD CONSTRAINT `email_template_versions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_queue` ADD CONSTRAINT `email_queue_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_queue` ADD CONSTRAINT `email_queue_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `email_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_queue` ADD CONSTRAINT `email_queue_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_deliveries` ADD CONSTRAINT `email_deliveries_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `email_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `email_events` ADD CONSTRAINT `email_events_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `email_deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `email_attachments` ADD CONSTRAINT `email_attachments_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `email_deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `email_preferences` ADD CONSTRAINT `email_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `email_analytics` ADD CONSTRAINT `email_analytics_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
