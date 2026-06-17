-- KuberOne AI Content Generation Engine

CREATE TABLE `content_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `content_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'CAMPAIGN', 'LANDING_PAGE', 'BLOG', 'FAQ', 'KNOWLEDGE_ARTICLE', 'SALES_SCRIPT', 'CALL_SCRIPT', 'FOLLOW_UP', 'REFERRAL_CAMPAIGN', 'COMMISSION_COMMUNICATION', 'SUPPORT_RESPONSE', 'ONBOARDING', 'TRAINING', 'SOCIAL_MEDIA') NOT NULL,
    `category` VARCHAR(64) NULL,
    `tone` ENUM('PROFESSIONAL', 'PREMIUM_FINTECH', 'SALES', 'SUPPORT', 'FORMAL', 'FRIENDLY', 'URGENT', 'PROMOTIONAL') NOT NULL DEFAULT 'PROFESSIONAL',
    `language` ENUM('EN', 'HI', 'HINGLISH') NOT NULL DEFAULT 'EN',
    `system_prompt` TEXT NULL,
    `user_prompt` TEXT NULL,
    `variables` JSON NULL,
    `sample_output` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_templates_code_key`(`code`),
    INDEX `content_templates_content_type_is_active_idx`(`content_type`, `is_active`),
    INDEX `content_templates_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_generation_requests` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `content_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'CAMPAIGN', 'LANDING_PAGE', 'BLOG', 'FAQ', 'KNOWLEDGE_ARTICLE', 'SALES_SCRIPT', 'CALL_SCRIPT', 'FOLLOW_UP', 'REFERRAL_CAMPAIGN', 'COMMISSION_COMMUNICATION', 'SUPPORT_RESPONSE', 'ONBOARDING', 'TRAINING', 'SOCIAL_MEDIA') NOT NULL,
    `mode` ENUM('GENERATE', 'REWRITE', 'EXPAND', 'SUMMARIZE', 'TRANSLATE', 'OPTIMIZE', 'PERSONALIZE', 'AB_VARIANT') NOT NULL DEFAULT 'GENERATE',
    `tone` ENUM('PROFESSIONAL', 'PREMIUM_FINTECH', 'SALES', 'SUPPORT', 'FORMAL', 'FRIENDLY', 'URGENT', 'PROMOTIONAL') NOT NULL DEFAULT 'PROFESSIONAL',
    `language` ENUM('EN', 'HI', 'HINGLISH') NOT NULL DEFAULT 'EN',
    `prompt` TEXT NULL,
    `source_text` TEXT NULL,
    `personalization` JSON NULL,
    `rag_enabled` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `campaign_id` CHAR(36) NULL,
    `variant_count` INTEGER NOT NULL DEFAULT 1,
    `metadata` JSON NULL,
    `requested_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `content_generation_requests_content_type_status_idx`(`content_type`, `status`),
    INDEX `content_generation_requests_requested_by_created_at_idx`(`requested_by`, `created_at`),
    INDEX `content_generation_requests_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_generation_results` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `variant_index` INTEGER NOT NULL DEFAULT 0,
    `title` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `subject` VARCHAR(500) NULL,
    `cta_label` VARCHAR(200) NULL,
    `cta_url` VARCHAR(500) NULL,
    `quality_status` ENUM('PASSED', 'WARNING', 'FAILED') NOT NULL DEFAULT 'PASSED',
    `quality_report` JSON NULL,
    `rag_sources` JSON NULL,
    `model_code` VARCHAR(80) NULL,
    `tokens_used` INTEGER NULL,
    `generation_ms` INTEGER NULL,
    `estimated_cost` DECIMAL(10, 6) NULL,
    `status` ENUM('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_generation_results_request_id_idx`(`request_id`),
    INDEX `content_generation_results_quality_status_idx`(`quality_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_versions` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `subject` VARCHAR(500) NULL,
    `change_note` VARCHAR(500) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `content_versions_request_id_version_key`(`request_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_approvals` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewer_id` CHAR(36) NULL,
    `comments` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_approvals_request_id_status_idx`(`request_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_feedback` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `tags` JSON NULL,
    `submitted_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_feedback_request_id_idx`(`request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_usage` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `channel` VARCHAR(32) NOT NULL,
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `used_by` CHAR(36) NOT NULL,

    INDEX `content_usage_request_id_used_at_idx`(`request_id`, `used_at`),
    INDEX `content_usage_channel_idx`(`channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_analytics` (
    `id` CHAR(36) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `content_type` ENUM('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'CAMPAIGN', 'LANDING_PAGE', 'BLOG', 'FAQ', 'KNOWLEDGE_ARTICLE', 'SALES_SCRIPT', 'CALL_SCRIPT', 'FOLLOW_UP', 'REFERRAL_CAMPAIGN', 'COMMISSION_COMMUNICATION', 'SUPPORT_RESPONSE', 'ONBOARDING', 'TRAINING', 'SOCIAL_MEDIA') NULL,
    `total_generated` INTEGER NOT NULL DEFAULT 0,
    `total_approved` INTEGER NOT NULL DEFAULT 0,
    `total_rejected` INTEGER NOT NULL DEFAULT 0,
    `total_published` INTEGER NOT NULL DEFAULT 0,
    `total_tokens` INTEGER NOT NULL DEFAULT 0,
    `total_cost` DECIMAL(12, 4) NOT NULL DEFAULT 0,
    `avg_generation_ms` INTEGER NOT NULL DEFAULT 0,
    `template_metrics` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `content_analytics_period_start_idx`(`period_start`),
    UNIQUE INDEX `content_analytics_period_start_period_end_content_type_key`(`period_start`, `period_end`, `content_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_audits` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NOT NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_audits_request_id_created_at_idx`(`request_id`, `created_at`),
    INDEX `content_audits_actor_id_idx`(`actor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_queue` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `payload` JSON NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` TEXT NULL,
    `scheduled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `content_queue_status_scheduled_at_idx`(`status`, `scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `content_templates` ADD CONSTRAINT `content_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_templates` ADD CONSTRAINT `content_templates_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_generation_requests` ADD CONSTRAINT `content_generation_requests_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `content_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_generation_requests` ADD CONSTRAINT `content_generation_requests_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content_generation_results` ADD CONSTRAINT `content_generation_results_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_versions` ADD CONSTRAINT `content_versions_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_versions` ADD CONSTRAINT `content_versions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content_approvals` ADD CONSTRAINT `content_approvals_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_approvals` ADD CONSTRAINT `content_approvals_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_feedback` ADD CONSTRAINT `content_feedback_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_feedback` ADD CONSTRAINT `content_feedback_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content_usage` ADD CONSTRAINT `content_usage_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `content_usage` ADD CONSTRAINT `content_usage_used_by_fkey` FOREIGN KEY (`used_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content_audits` ADD CONSTRAINT `content_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content_queue` ADD CONSTRAINT `content_queue_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `content_generation_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
