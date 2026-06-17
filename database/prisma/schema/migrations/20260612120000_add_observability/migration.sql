-- CreateTable observability platform
CREATE TABLE `observability_logs` (
    `id` CHAR(36) NOT NULL,
    `level` ENUM('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL') NOT NULL DEFAULT 'INFO',
    `category` ENUM('APPLICATION', 'AUTH', 'RBAC', 'CUSTOMER', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL', 'COMMISSION', 'SUPPORT', 'NOTIFICATION', 'AI', 'DATABASE', 'SYSTEM', 'SECURITY', 'BUSINESS') NOT NULL DEFAULT 'APPLICATION',
    `module` VARCHAR(64) NOT NULL,
    `action` VARCHAR(128) NOT NULL,
    `message` TEXT NOT NULL,
    `request_id` VARCHAR(64) NULL,
    `correlation_id` VARCHAR(64) NULL,
    `trace_id` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `workflow_id` VARCHAR(64) NULL,
    `user_id` CHAR(36) NULL,
    `user_role` VARCHAR(64) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `device` VARCHAR(128) NULL,
    `environment` VARCHAR(32) NOT NULL DEFAULT 'development',
    `duration_ms` INTEGER NULL,
    `status_code` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `observability_logs_request_id_idx`(`request_id`),
    INDEX `observability_logs_correlation_id_idx`(`correlation_id`),
    INDEX `observability_logs_trace_id_idx`(`trace_id`),
    INDEX `observability_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `observability_logs_category_level_created_at_idx`(`category`, `level`, `created_at`),
    INDEX `observability_logs_module_created_at_idx`(`module`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `observability_traces` (
    `id` CHAR(36) NOT NULL,
    `trace_id` VARCHAR(64) NOT NULL,
    `correlation_id` VARCHAR(64) NULL,
    `request_id` VARCHAR(64) NULL,
    `service_name` VARCHAR(64) NOT NULL DEFAULT 'kuberone-api',
    `operation` VARCHAR(200) NOT NULL,
    `status` ENUM('OK', 'ERROR', 'UNSET') NOT NULL DEFAULT 'UNSET',
    `duration_ms` INTEGER NULL,
    `user_id` CHAR(36) NULL,
    `spans` JSON NULL,
    `metadata` JSON NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `observability_traces_trace_id_key`(`trace_id`),
    INDEX `observability_traces_correlation_id_idx`(`correlation_id`),
    INDEX `observability_traces_request_id_idx`(`request_id`),
    INDEX `observability_traces_started_at_idx`(`started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `observability_errors` (
    `id` CHAR(36) NOT NULL,
    `source` ENUM('BACKEND', 'FRONTEND', 'MOBILE', 'AI', 'NOTIFICATION', 'DATABASE') NOT NULL DEFAULT 'BACKEND',
    `error_code` VARCHAR(64) NULL,
    `error_type` VARCHAR(128) NOT NULL,
    `message` TEXT NOT NULL,
    `stack_trace` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `correlation_id` VARCHAR(64) NULL,
    `trace_id` VARCHAR(64) NULL,
    `user_id` CHAR(36) NULL,
    `module` VARCHAR(64) NULL,
    `path` VARCHAR(500) NULL,
    `method` VARCHAR(16) NULL,
    `status_code` INTEGER NULL,
    `metadata` JSON NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `observability_errors_source_created_at_idx`(`source`, `created_at`),
    INDEX `observability_errors_error_code_created_at_idx`(`error_code`, `created_at`),
    INDEX `observability_errors_request_id_idx`(`request_id`),
    INDEX `observability_errors_trace_id_idx`(`trace_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `observability_events` (
    `id` CHAR(36) NOT NULL,
    `event_type` ENUM('BUSINESS', 'AUTH', 'SECURITY', 'WORKFLOW', 'AI', 'NOTIFICATION') NOT NULL,
    `event_name` VARCHAR(128) NOT NULL,
    `category` ENUM('APPLICATION', 'AUTH', 'RBAC', 'CUSTOMER', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL', 'COMMISSION', 'SUPPORT', 'NOTIFICATION', 'AI', 'DATABASE', 'SYSTEM', 'SECURITY', 'BUSINESS') NOT NULL DEFAULT 'BUSINESS',
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `request_id` VARCHAR(64) NULL,
    `correlation_id` VARCHAR(64) NULL,
    `trace_id` VARCHAR(64) NULL,
    `workflow_id` VARCHAR(64) NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `observability_events_event_type_event_name_created_at_idx`(`event_type`, `event_name`, `created_at`),
    INDEX `observability_events_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `observability_events_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `observability_events_workflow_id_idx`(`workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `observability_retention_policies` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `retention_type` ENUM('APPLICATION', 'AUDIT', 'SECURITY', 'AI', 'SYSTEM') NOT NULL,
    `retention_days` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `observability_retention_policies_code_key`(`code`),
    INDEX `observability_retention_policies_retention_type_is_active_idx`(`retention_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `observability_logs` ADD CONSTRAINT `observability_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `observability_traces` ADD CONSTRAINT `observability_traces_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `observability_errors` ADD CONSTRAINT `observability_errors_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `observability_events` ADD CONSTRAINT `observability_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
