-- Hypercare Support Phase

CREATE TABLE `hypercare_sessions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `status` ENUM('ACTIVE', 'EXTENDED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `phase` ENUM('WEEK_1', 'WEEK_2', 'WEEK_3', 'WEEK_4', 'EXTENSION') NOT NULL DEFAULT 'WEEK_1',
    `week_number` INTEGER NOT NULL DEFAULT 1,
    `launch_execution_id` CHAR(36) NULL,
    `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_date` DATETIME(3) NULL,
    `extended_at` DATETIME(3) NULL,
    `stability_pct` INTEGER NOT NULL DEFAULT 0,
    `adoption_pct` INTEGER NOT NULL DEFAULT 0,
    `resolution_pct` INTEGER NOT NULL DEFAULT 0,
    `performance_score` INTEGER NOT NULL DEFAULT 0,
    `ai_stability_pct` INTEGER NOT NULL DEFAULT 0,
    `final_status` ENUM('UNSTABLE', 'STABILIZING', 'STABLE', 'PRODUCTION_STABILIZED') NOT NULL DEFAULT 'STABILIZING',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `hypercare_sessions_code_key`(`code`),
    INDEX `hypercare_sessions_status_phase_idx`(`status`, `phase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hypercare_issues` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `category` ENUM('CUSTOMER', 'DSA', 'CRM', 'AI', 'NOTIFICATION', 'PERFORMANCE', 'BUG', 'SUPPORT') NOT NULL,
    `issue_type` ENUM('BUG', 'SUPPORT', 'PERFORMANCE', 'HOTFIX', 'PATCH') NOT NULL DEFAULT 'BUG',
    `severity` ENUM('SEV_1', 'SEV_2', 'SEV_3', 'SEV_4') NOT NULL DEFAULT 'SEV_3',
    `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `hotfix_required` BOOLEAN NOT NULL DEFAULT false,
    `patch_required` BOOLEAN NOT NULL DEFAULT false,
    `assigned_to_id` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `hypercare_issues_code_key`(`code`),
    INDEX `hypercare_issues_session_id_status_severity_idx`(`session_id`, `status`, `severity`),
    INDEX `hypercare_issues_category_status_idx`(`category`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hypercare_incidents` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('SEV_1', 'SEV_2', 'SEV_3', 'SEV_4') NOT NULL DEFAULT 'SEV_3',
    `status` ENUM('OPEN', 'INVESTIGATING', 'ESCALATED', 'MITIGATED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `sla_response_minutes` INTEGER NOT NULL DEFAULT 240,
    `sla_deadline` DATETIME(3) NULL,
    `responded_at` DATETIME(3) NULL,
    `resolved_at` DATETIME(3) NULL,
    `escalation_level` INTEGER NOT NULL DEFAULT 1,
    `runbook` TEXT NULL,
    `comm_template` VARCHAR(128) NULL,
    `assigned_to_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `hypercare_incidents_code_key`(`code`),
    INDEX `hypercare_incidents_session_id_severity_status_idx`(`session_id`, `severity`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hypercare_metrics` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `category` ENUM('SYSTEM', 'API', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'BUSINESS', 'ADOPTION', 'PERFORMANCE') NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(32) NULL,
    `threshold` DOUBLE NULL,
    `is_healthy` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `hypercare_metrics_session_id_category_recorded_at_idx`(`session_id`, `category`, `recorded_at`),
    INDEX `hypercare_metrics_name_recorded_at_idx`(`name`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hypercare_reports` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `report_type` ENUM('DAILY', 'WEEKLY', 'EXECUTIVE', 'INCIDENT', 'ADOPTION', 'PERFORMANCE', 'HYPERCARE') NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(500) NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `hypercare_reports_session_id_report_type_generated_at_idx`(`session_id`, `report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hypercare_rcas` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `target_type` ENUM('INCIDENT', 'ISSUE', 'PERFORMANCE', 'SECURITY') NOT NULL,
    `target_id` CHAR(36) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `root_cause` TEXT NOT NULL,
    `corrective_action` TEXT NULL,
    `preventive_action` TEXT NULL,
    `status` ENUM('DRAFT', 'REVIEW', 'APPROVED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `authored_by_id` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `hypercare_rcas_session_id_target_type_status_idx`(`session_id`, `target_type`, `status`),
    INDEX `hypercare_rcas_target_type_target_id_idx`(`target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `hypercare_sessions` ADD CONSTRAINT `hypercare_sessions_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `hypercare_issues` ADD CONSTRAINT `hypercare_issues_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `hypercare_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hypercare_issues` ADD CONSTRAINT `hypercare_issues_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `hypercare_incidents` ADD CONSTRAINT `hypercare_incidents_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `hypercare_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hypercare_incidents` ADD CONSTRAINT `hypercare_incidents_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `hypercare_metrics` ADD CONSTRAINT `hypercare_metrics_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `hypercare_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hypercare_reports` ADD CONSTRAINT `hypercare_reports_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `hypercare_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hypercare_rcas` ADD CONSTRAINT `hypercare_rcas_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `hypercare_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `hypercare_rcas` ADD CONSTRAINT `hypercare_rcas_authored_by_id_fkey` FOREIGN KEY (`authored_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
