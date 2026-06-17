-- Error Tracking System

CREATE TABLE `error_groups` (
    `id` CHAR(36) NOT NULL,
    `fingerprint` VARCHAR(128) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `message` TEXT NOT NULL,
    `source` ENUM('BACKEND', 'CRM', 'CUSTOMER_APP', 'DSA_APP', 'AI', 'NOTIFICATION', 'DATABASE', 'QUEUE', 'INFRASTRUCTURE', 'VOICE_AI', 'RAG', 'OPENAI') NOT NULL,
    `category` ENUM('UNHANDLED_EXCEPTION', 'VALIDATION', 'AUTHORIZATION', 'AUTHENTICATION', 'BUSINESS_RULE', 'QUEUE_FAILURE', 'CRON_FAILURE', 'WORKER_FAILURE', 'PAGE_CRASH', 'COMPONENT_ERROR', 'FORM_ERROR', 'CHART_ERROR', 'TABLE_ERROR', 'NAVIGATION_ERROR', 'THEME_ERROR', 'API_ERROR', 'OFFLINE_ERROR', 'PUSH_ERROR', 'PROMPT_FAILURE', 'RATE_LIMIT', 'TIMEOUT', 'RAG_RETRIEVAL_FAILURE', 'HALLUCINATION_REPORT', 'EMAIL_FAILURE', 'SMS_FAILURE', 'WHATSAPP_FAILURE', 'RETRY_FAILURE', 'DEAD_LETTER', 'SLOW_QUERY', 'DEADLOCK', 'MIGRATION_FAILURE', 'CONNECTION_FAILURE', 'CONSTRAINT_VIOLATION', 'PRISMA_ERROR', 'INFRASTRUCTURE') NOT NULL DEFAULT 'UNHANDLED_EXCEPTION',
    `priority` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('NEW', 'INVESTIGATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED') NOT NULL DEFAULT 'NEW',
    `module` VARCHAR(64) NULL,
    `environment` VARCHAR(32) NOT NULL DEFAULT 'development',
    `stack_signature` TEXT NULL,
    `occurrence_count` INTEGER NOT NULL DEFAULT 1,
    `affected_user_count` INTEGER NOT NULL DEFAULT 0,
    `first_seen_at` DATETIME(3) NOT NULL,
    `last_seen_at` DATETIME(3) NOT NULL,
    `assigned_to_id` CHAR(36) NULL,
    `trace_id_sample` VARCHAR(64) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `error_groups_fingerprint_key`(`fingerprint`),
    INDEX `error_groups_status_priority_idx`(`status`, `priority`),
    INDEX `error_groups_source_last_seen_at_idx`(`source`, `last_seen_at`),
    INDEX `error_groups_module_last_seen_at_idx`(`module`, `last_seen_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_events` (
    `id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NULL,
    `source` ENUM('BACKEND', 'CRM', 'CUSTOMER_APP', 'DSA_APP', 'AI', 'NOTIFICATION', 'DATABASE', 'QUEUE', 'INFRASTRUCTURE', 'VOICE_AI', 'RAG', 'OPENAI') NOT NULL,
    `category` ENUM('UNHANDLED_EXCEPTION', 'VALIDATION', 'AUTHORIZATION', 'AUTHENTICATION', 'BUSINESS_RULE', 'QUEUE_FAILURE', 'CRON_FAILURE', 'WORKER_FAILURE', 'PAGE_CRASH', 'COMPONENT_ERROR', 'FORM_ERROR', 'CHART_ERROR', 'TABLE_ERROR', 'NAVIGATION_ERROR', 'THEME_ERROR', 'API_ERROR', 'OFFLINE_ERROR', 'PUSH_ERROR', 'PROMPT_FAILURE', 'RATE_LIMIT', 'TIMEOUT', 'RAG_RETRIEVAL_FAILURE', 'HALLUCINATION_REPORT', 'EMAIL_FAILURE', 'SMS_FAILURE', 'WHATSAPP_FAILURE', 'RETRY_FAILURE', 'DEAD_LETTER', 'SLOW_QUERY', 'DEADLOCK', 'MIGRATION_FAILURE', 'CONNECTION_FAILURE', 'CONSTRAINT_VIOLATION', 'PRISMA_ERROR', 'INFRASTRUCTURE') NOT NULL DEFAULT 'UNHANDLED_EXCEPTION',
    `error_code` VARCHAR(64) NULL,
    `error_type` VARCHAR(128) NOT NULL,
    `message` TEXT NOT NULL,
    `stack_trace` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `correlation_id` VARCHAR(64) NULL,
    `trace_id` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `workflow_id` VARCHAR(64) NULL,
    `user_id` CHAR(36) NULL,
    `user_role` VARCHAR(64) NULL,
    `path` VARCHAR(500) NULL,
    `method` VARCHAR(16) NULL,
    `status_code` INTEGER NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `device` VARCHAR(128) NULL,
    `browser` VARCHAR(128) NULL,
    `app_version` VARCHAR(32) NULL,
    `os_version` VARCHAR(64) NULL,
    `region` VARCHAR(64) NULL,
    `branch` VARCHAR(64) NULL,
    `environment` VARCHAR(32) NOT NULL DEFAULT 'development',
    `request_payload` JSON NULL,
    `response_payload` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `error_events_group_id_created_at_idx`(`group_id`, `created_at`),
    INDEX `error_events_source_created_at_idx`(`source`, `created_at`),
    INDEX `error_events_trace_id_idx`(`trace_id`),
    INDEX `error_events_request_id_idx`(`request_id`),
    INDEX `error_events_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_occurrences` (
    `id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `fingerprint` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `error_occurrences_event_id_key`(`event_id`),
    INDEX `error_occurrences_group_id_created_at_idx`(`group_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_assignments` (
    `id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NOT NULL,
    `assigned_to_id` CHAR(36) NOT NULL,
    `assigned_by_id` CHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('NEW', 'INVESTIGATING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'IGNORED') NOT NULL DEFAULT 'ASSIGNED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `error_assignments_group_id_created_at_idx`(`group_id`, `created_at`),
    INDEX `error_assignments_assigned_to_id_status_idx`(`assigned_to_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_resolutions` (
    `id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NOT NULL,
    `resolved_by_id` CHAR(36) NOT NULL,
    `resolution_type` VARCHAR(64) NOT NULL,
    `root_cause` TEXT NULL,
    `fix_description` TEXT NULL,
    `verified_by_id` CHAR(36) NULL,
    `verified_at` DATETIME(3) NULL,
    `mttr_minutes` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `error_resolutions_group_id_created_at_idx`(`group_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_comments` (
    `id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `error_comments_group_id_created_at_idx`(`group_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_analytics` (
    `id` CHAR(36) NOT NULL,
    `period_start` DATETIME(3) NOT NULL,
    `period_end` DATETIME(3) NOT NULL,
    `total_errors` INTEGER NOT NULL DEFAULT 0,
    `new_errors` INTEGER NOT NULL DEFAULT 0,
    `resolved_errors` INTEGER NOT NULL DEFAULT 0,
    `critical_count` INTEGER NOT NULL DEFAULT 0,
    `affected_users` INTEGER NOT NULL DEFAULT 0,
    `mttd_minutes` DECIMAL(10, 2) NULL,
    `mttr_minutes` DECIMAL(10, 2) NULL,
    `errors_by_source` JSON NOT NULL,
    `errors_by_module` JSON NOT NULL,
    `errors_by_priority` JSON NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `error_analytics_period_start_period_end_idx`(`period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `error_alerts` (
    `id` CHAR(36) NOT NULL,
    `rule_code` VARCHAR(64) NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'HIGH',
    `status` ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SILENCED') NOT NULL DEFAULT 'OPEN',
    `source` ENUM('BACKEND', 'CRM', 'CUSTOMER_APP', 'DSA_APP', 'AI', 'NOTIFICATION', 'DATABASE', 'QUEUE', 'INFRASTRUCTURE', 'VOICE_AI', 'RAG', 'OPENAI') NULL,
    `group_id` CHAR(36) NULL,
    `channels` JSON NOT NULL,
    `metadata` JSON NULL,
    `acknowledged_by` CHAR(36) NULL,
    `acknowledged_at` DATETIME(3) NULL,
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `error_alerts_code_key`(`code`),
    INDEX `error_alerts_status_severity_idx`(`status`, `severity`),
    INDEX `error_alerts_source_created_at_idx`(`source`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `error_groups` ADD CONSTRAINT `error_groups_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_events` ADD CONSTRAINT `error_events_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_events` ADD CONSTRAINT `error_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_occurrences` ADD CONSTRAINT `error_occurrences_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `error_occurrences` ADD CONSTRAINT `error_occurrences_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `error_events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `error_assignments` ADD CONSTRAINT `error_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `error_assignments` ADD CONSTRAINT `error_assignments_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `error_assignments` ADD CONSTRAINT `error_assignments_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `error_resolutions` ADD CONSTRAINT `error_resolutions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `error_resolutions` ADD CONSTRAINT `error_resolutions_resolved_by_id_fkey` FOREIGN KEY (`resolved_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `error_resolutions` ADD CONSTRAINT `error_resolutions_verified_by_id_fkey` FOREIGN KEY (`verified_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_comments` ADD CONSTRAINT `error_comments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `error_comments` ADD CONSTRAINT `error_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `error_alerts` ADD CONSTRAINT `error_alerts_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `error_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_alerts` ADD CONSTRAINT `error_alerts_acknowledged_by_fkey` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `error_alerts` ADD CONSTRAINT `error_alerts_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
