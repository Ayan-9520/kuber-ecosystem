-- Go-Live Execution Framework

-- AlterTable launch_executions
ALTER TABLE `launch_executions` ADD COLUMN `current_step` ENUM('PRODUCTION_FREEZE', 'DATABASE_BACKUP', 'RELEASE_DEPLOYMENT', 'HEALTH_VALIDATION', 'SMOKE_TESTING', 'BUSINESS_VALIDATION', 'LAUNCH_APPROVAL', 'TRAFFIC_ENABLEMENT', 'COMPLETED') NOT NULL DEFAULT 'PRODUCTION_FREEZE';
ALTER TABLE `launch_executions` ADD COLUMN `success_pct` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `launch_executions` ADD COLUMN `final_status` ENUM('FAILED', 'PARTIAL_SUCCESS', 'SUCCESSFUL_GO_LIVE') NULL;
ALTER TABLE `launch_executions` ADD COLUMN `services_health` JSON NULL;

-- AlterEnum GoLiveAuditAction
ALTER TABLE `launch_audits` MODIFY `action` ENUM('CHECKLIST_UPDATE', 'APPROVAL_SUBMIT', 'APPROVAL_DECIDE', 'LAUNCH_START', 'LAUNCH_COMPLETE', 'LAUNCH_ROLLBACK', 'GATE_EVALUATE', 'REPORT_GENERATE', 'WORKFLOW_STEP', 'SMOKE_TEST', 'INCIDENT_CREATE', 'INCIDENT_UPDATE', 'WAR_ROOM_ACTIVATE', 'METRIC_SNAPSHOT') NOT NULL;

-- AlterEnum GoLiveReportType
ALTER TABLE `go_live_reports` MODIFY `report_type` ENUM('READINESS', 'APPROVAL', 'RELEASE', 'RISK', 'LAUNCH', 'INCIDENT', 'TRAFFIC', 'HEALTH', 'EXECUTIVE') NOT NULL;

CREATE TABLE `launch_events` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `event_type` ENUM('WORKFLOW_STEP', 'VALIDATION', 'SMOKE_TEST', 'DEPLOYMENT', 'HEALTH_CHECK', 'TRAFFIC', 'INCIDENT', 'ROLLBACK', 'APPROVAL', 'WAR_ROOM', 'ALERT', 'SYSTEM') NOT NULL,
    `step` ENUM('PRODUCTION_FREEZE', 'DATABASE_BACKUP', 'RELEASE_DEPLOYMENT', 'HEALTH_VALIDATION', 'SMOKE_TESTING', 'BUSINESS_VALIDATION', 'LAUNCH_APPROVAL', 'TRAFFIC_ENABLEMENT', 'COMPLETED') NULL,
    `title` VARCHAR(300) NOT NULL,
    `message` TEXT NULL,
    `severity` ENUM('SEV_1', 'SEV_2', 'SEV_3', 'SEV_4') NULL,
    `metadata` JSON NULL,
    `actor_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `launch_events_launch_execution_id_created_at_idx`(`launch_execution_id`, `created_at`),
    INDEX `launch_events_event_type_created_at_idx`(`event_type`, `created_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `war_room_sessions` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `status` ENUM('STANDBY', 'ACTIVE', 'STAND_DOWN') NOT NULL DEFAULT 'STANDBY',
    `commander_id` CHAR(36) NULL,
    `teams` JSON NULL,
    `communication_matrix` JSON NULL,
    `bridge_url` VARCHAR(500) NULL,
    `started_at` DATETIME(3) NULL,
    `ended_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `war_room_sessions_code_key`(`code`),
    INDEX `war_room_sessions_launch_execution_id_status_idx`(`launch_execution_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `launch_incidents` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `war_room_session_id` CHAR(36) NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('SEV_1', 'SEV_2', 'SEV_3', 'SEV_4') NOT NULL DEFAULT 'SEV_3',
    `status` ENUM('OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `runbook` TEXT NULL,
    `escalation_level` INTEGER NOT NULL DEFAULT 1,
    `comm_template` VARCHAR(128) NULL,
    `assigned_to_id` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `launch_incidents_code_key`(`code`),
    INDEX `launch_incidents_launch_execution_id_severity_status_idx`(`launch_execution_id`, `severity`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `launch_metrics` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `category` ENUM('TRAFFIC', 'PERFORMANCE', 'ERRORS', 'BUSINESS', 'INFRASTRUCTURE', 'NOTIFICATIONS', 'AI') NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `value` DOUBLE NOT NULL,
    `unit` VARCHAR(32) NULL,
    `threshold` DOUBLE NULL,
    `is_healthy` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `launch_metrics_launch_execution_id_category_recorded_at_idx`(`launch_execution_id`, `category`, `recorded_at`),
    INDEX `launch_metrics_name_recorded_at_idx`(`name`, `recorded_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `launch_events` ADD CONSTRAINT `launch_events_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `launch_events` ADD CONSTRAINT `launch_events_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `war_room_sessions` ADD CONSTRAINT `war_room_sessions_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `war_room_sessions` ADD CONSTRAINT `war_room_sessions_commander_id_fkey` FOREIGN KEY (`commander_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `launch_incidents` ADD CONSTRAINT `launch_incidents_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `launch_incidents` ADD CONSTRAINT `launch_incidents_war_room_session_id_fkey` FOREIGN KEY (`war_room_session_id`) REFERENCES `war_room_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `launch_incidents` ADD CONSTRAINT `launch_incidents_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `launch_metrics` ADD CONSTRAINT `launch_metrics_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
