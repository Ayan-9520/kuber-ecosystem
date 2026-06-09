-- Communication channel providers, dead letter queue, push topics, WhatsApp template registry

CREATE TABLE `communication_providers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `provider_type` ENUM('SMTP', 'SENDGRID', 'MSG91', 'TWILIO', 'META_WHATSAPP', 'FCM', 'MOCK') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `rate_limit` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `communication_providers_code_key`(`code`),
    INDEX `communication_providers_channel_is_active_idx`(`channel`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notification_dead_letters` (
    `id` CHAR(36) NOT NULL,
    `queue_id` CHAR(36) NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NOT NULL,
    `recipient_user_id` CHAR(36) NULL,
    `payload` JSON NOT NULL,
    `error_message` TEXT NOT NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_dead_letters_channel_created_at_idx`(`channel`, `created_at`),
    INDEX `notification_dead_letters_resolved_at_idx`(`resolved_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_topics` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `app_target` VARCHAR(30) NOT NULL DEFAULT 'ALL',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `push_topics_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `push_topic_subscriptions` (
    `id` CHAR(36) NOT NULL,
    `topic_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `device_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `push_topic_subscriptions_topic_id_user_id_device_id_key`(`topic_id`, `user_id`, `device_id`),
    INDEX `push_topic_subscriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `whatsapp_template_registry` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `meta_name` VARCHAR(100) NOT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `category` VARCHAR(30) NOT NULL DEFAULT 'UTILITY',
    `variables` JSON NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `whatsapp_template_registry_code_key`(`code`),
    INDEX `whatsapp_template_registry_event_type_is_active_idx`(`event_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `email_logs` ADD COLUMN `opened_at` DATETIME(3) NULL;
ALTER TABLE `whatsapp_logs` ADD COLUMN `read_at` DATETIME(3) NULL;

ALTER TABLE `push_topic_subscriptions` ADD CONSTRAINT `push_topic_subscriptions_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `push_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `push_topic_subscriptions` ADD CONSTRAINT `push_topic_subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
