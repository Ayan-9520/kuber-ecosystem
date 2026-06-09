-- KuberOne Enterprise Push Notification Infrastructure

ALTER TABLE `push_topics` ADD COLUMN `topic_type` ENUM('BRANCH', 'REGION', 'ROLE', 'CAMPAIGN', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM';
CREATE INDEX `push_topics_topic_type_is_active_idx` ON `push_topics`(`topic_type`, `is_active`);

CREATE TABLE `push_providers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provider_type` ENUM('FCM', 'ONESIGNAL', 'AZURE_NOTIFICATION_HUB', 'MOCK') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `rate_limit` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `push_providers_code_key`(`code`),
    INDEX `push_providers_is_active_is_default_idx`(`is_active`, `is_default`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `category` ENUM('AUTH', 'TRANSACTIONAL', 'SUPPORT', 'MARKETING', 'AI', 'REMINDER') NOT NULL DEFAULT 'TRANSACTIONAL',
    `event_type` VARCHAR(50) NULL,
    `title` VARCHAR(300) NOT NULL,
    `body` VARCHAR(1000) NOT NULL,
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
    UNIQUE INDEX `push_templates_code_key`(`code`),
    INDEX `push_templates_category_is_active_idx`(`category`, `is_active`),
    INDEX `push_templates_event_type_is_active_idx`(`event_type`, `is_active`),
    INDEX `push_templates_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_template_versions` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `body` VARCHAR(1000) NOT NULL,
    `variables` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,
    UNIQUE INDEX `push_template_versions_template_id_version_key`(`template_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_devices` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `device_id` VARCHAR(100) NOT NULL,
    `platform` VARCHAR(20) NOT NULL,
    `app_target` ENUM('CUSTOMER', 'DSA', 'EMPLOYEE', 'ALL') NOT NULL DEFAULT 'CUSTOMER',
    `app_version` VARCHAR(20) NULL,
    `legacy_device_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_active_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `push_devices_user_id_device_id_app_target_key`(`user_id`, `device_id`, `app_target`),
    INDEX `push_devices_user_id_is_active_idx`(`user_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_tokens` (
    `id` CHAR(36) NOT NULL,
    `push_device_id` CHAR(36) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `provider` VARCHAR(20) NOT NULL DEFAULT 'FCM',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `rotated_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `push_tokens_token_idx`(`token`(191)),
    INDEX `push_tokens_push_device_id_is_active_idx`(`push_device_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_queue` (
    `id` CHAR(36) NOT NULL,
    `queue_type` ENUM('NOTIFICATION', 'RETRY', 'FAILED', 'PRIORITY', 'SCHEDULED', 'TOPIC') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `recipient_user_id` CHAR(36) NULL,
    `push_device_id` CHAR(36) NULL,
    `topic_code` VARCHAR(80) NULL,
    `template_id` CHAR(36) NULL,
    `template_code` VARCHAR(80) NULL,
    `title` VARCHAR(300) NULL,
    `body` VARCHAR(1000) NULL,
    `variables` JSON NULL,
    `payload` JSON NULL,
    `provider_id` CHAR(36) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `processed_at` DATETIME(3) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` VARCHAR(500) NULL,
    `push_notification_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `push_queue_status_priority_scheduled_at_idx`(`status`, `priority`, `scheduled_at`),
    INDEX `push_queue_queue_type_status_idx`(`queue_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_notification_deliveries` (
    `id` CHAR(36) NOT NULL,
    `push_notification_id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NULL,
    `template_id` CHAR(36) NULL,
    `push_device_id` CHAR(36) NULL,
    `status` ENUM('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'DISMISSED', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'QUEUED',
    `provider_ref` VARCHAR(200) NULL,
    `queued_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `opened_at` DATETIME(3) NULL,
    `clicked_at` DATETIME(3) NULL,
    `dismissed_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `expired_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `push_notification_deliveries_push_notification_id_key`(`push_notification_id`),
    INDEX `push_notification_deliveries_status_created_at_idx`(`status`, `created_at`),
    INDEX `push_notification_deliveries_provider_ref_idx`(`provider_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_notification_logs` (
    `id` CHAR(36) NOT NULL,
    `delivery_id` CHAR(36) NOT NULL,
    `action` VARCHAR(30) NOT NULL,
    `status` VARCHAR(30) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `push_notification_logs_delivery_id_created_at_idx`(`delivery_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_events` (
    `id` CHAR(36) NOT NULL,
    `delivery_id` CHAR(36) NOT NULL,
    `event_type` ENUM('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'DISMISSED', 'FAILED', 'EXPIRED') NOT NULL,
    `metadata` JSON NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `push_events_delivery_id_occurred_at_idx`(`delivery_id`, `occurred_at`),
    INDEX `push_events_event_type_idx`(`event_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_preferences` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `push_device_id` CHAR(36) NULL,
    `category` ENUM('AUTH', 'TRANSACTIONAL', 'SUPPORT', 'MARKETING', 'AI', 'REMINDER') NULL,
    `event_type` VARCHAR(50) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,
    `do_not_disturb` BOOLEAN NOT NULL DEFAULT false,
    `mute_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `push_preferences_user_id_push_device_id_category_event_type_key`(`user_id`, `push_device_id`, `category`, `event_type`),
    INDEX `push_preferences_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_analytics` (
    `id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `template_id` CHAR(36) NULL,
    `category` ENUM('AUTH', 'TRANSACTIONAL', 'SUPPORT', 'MARKETING', 'AI', 'REMINDER') NULL,
    `provider_id` CHAR(36) NULL,
    `topic_code` VARCHAR(80) NULL,
    `sent_count` INTEGER NOT NULL DEFAULT 0,
    `delivered_count` INTEGER NOT NULL DEFAULT 0,
    `opened_count` INTEGER NOT NULL DEFAULT 0,
    `clicked_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `dismissed_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `push_analytics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `push_template_versions` ADD CONSTRAINT `push_template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `push_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_devices` ADD CONSTRAINT `push_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_tokens` ADD CONSTRAINT `push_tokens_push_device_id_fkey` FOREIGN KEY (`push_device_id`) REFERENCES `push_devices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_queue` ADD CONSTRAINT `push_queue_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `push_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `push_queue` ADD CONSTRAINT `push_queue_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `push_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `push_queue` ADD CONSTRAINT `push_queue_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `push_notification_deliveries` ADD CONSTRAINT `push_notification_deliveries_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `push_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `push_notification_logs` ADD CONSTRAINT `push_notification_logs_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `push_notification_deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_events` ADD CONSTRAINT `push_events_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `push_notification_deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_preferences` ADD CONSTRAINT `push_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_analytics` ADD CONSTRAINT `push_analytics_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `push_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
