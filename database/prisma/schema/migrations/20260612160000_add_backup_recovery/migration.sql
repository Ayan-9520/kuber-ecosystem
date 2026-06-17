-- Backup & Recovery Platform (run via prisma migrate deploy)

CREATE TABLE `backup_retention_policies` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `schedule` ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL') NOT NULL,
    `retention_hours` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `backup_retention_policies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `backup_jobs` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `scope` ENUM('DATABASE', 'DOCUMENTS', 'MEDIA', 'AI_KNOWLEDGE', 'CONFIGURATION', 'LOGS', 'APPLICATION') NOT NULL,
    `backup_type` ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'PITR') NOT NULL,
    `schedule` ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'MANUAL') NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `cron_expr` VARCHAR(64) NULL,
    `retention_code` VARCHAR(64) NULL,
    `is_encrypted` BOOLEAN NOT NULL DEFAULT true,
    `is_immutable` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `last_run_at` DATETIME(3) NULL,
    `next_run_at` DATETIME(3) NULL,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `backup_jobs_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `backup_executions` (
    `id` CHAR(36) NOT NULL,
    `job_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'VERIFIED') NOT NULL DEFAULT 'PENDING',
    `backup_type` ENUM('FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'PITR') NOT NULL,
    `scope` ENUM('DATABASE', 'DOCUMENTS', 'MEDIA', 'AI_KNOWLEDGE', 'CONFIGURATION', 'LOGS', 'APPLICATION') NOT NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `duration_ms` INTEGER NULL,
    `total_size_bytes` BIGINT NULL,
    `file_count` INTEGER NOT NULL DEFAULT 0,
    `checksum` VARCHAR(128) NULL,
    `storage_path` VARCHAR(500) NULL,
    `error_message` TEXT NULL,
    `metadata` JSON NULL,
    `triggered_by` VARCHAR(32) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `backup_executions_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `backup_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `backup_files` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(300) NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `s3_bucket` VARCHAR(128) NOT NULL,
    `mime_type` VARCHAR(128) NULL,
    `size_bytes` BIGINT NOT NULL,
    `checksum` VARCHAR(128) NULL,
    `is_encrypted` BOOLEAN NOT NULL DEFAULT true,
    `is_immutable` BOOLEAN NOT NULL DEFAULT false,
    `region` VARCHAR(32) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `backup_files_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `backup_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `restore_requests` (
    `id` CHAR(36) NOT NULL,
    `scope` ENUM('SINGLE_RECORD', 'CUSTOMER', 'LEAD', 'APPLICATION', 'DOCUMENT', 'TABLE', 'DATABASE', 'PLATFORM') NOT NULL,
    `target_type` VARCHAR(64) NULL,
    `target_id` CHAR(36) NULL,
    `execution_id` CHAR(36) NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'VALIDATED') NOT NULL DEFAULT 'PENDING',
    `requested_by_id` CHAR(36) NOT NULL,
    `reason` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `restore_requests_requested_by_id_fkey` FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `restore_executions` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'VALIDATED') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `duration_ms` INTEGER NULL,
    `rto_minutes` INTEGER NULL,
    `records_restored` INTEGER NULL,
    `error_message` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `restore_executions_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `restore_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `disaster_recovery_plans` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'STORAGE_FAILURE', 'CLOUD_FAILURE', 'REGION_FAILURE', 'SECURITY_INCIDENT', 'RANSOMWARE', 'ACCIDENTAL_DELETION') NOT NULL,
    `description` TEXT NOT NULL,
    `playbook` JSON NOT NULL,
    `rpo_minutes` INTEGER NOT NULL DEFAULT 15,
    `rto_minutes` INTEGER NOT NULL DEFAULT 60,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_tested_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `disaster_recovery_plans_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `recovery_audits` (
    `id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NULL,
    `audit_type` VARCHAR(64) NOT NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'STORAGE_FAILURE', 'CLOUD_FAILURE', 'REGION_FAILURE', 'SECURITY_INCIDENT', 'RANSOMWARE', 'ACCIDENTAL_DELETION') NULL,
    `status` ENUM('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'SCHEDULED',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `rpo_achieved` INTEGER NULL,
    `rto_achieved` INTEGER NULL,
    `passed` BOOLEAN NULL,
    `findings` TEXT NULL,
    `report` JSON NULL,
    `executed_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `recovery_audits_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `disaster_recovery_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `recovery_audits_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `backup_jobs` ADD CONSTRAINT `backup_jobs_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
