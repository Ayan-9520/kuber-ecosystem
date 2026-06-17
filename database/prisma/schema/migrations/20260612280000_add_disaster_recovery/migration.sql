-- Extend DrScenario enum
ALTER TABLE `disaster_recovery_plans` MODIFY `scenario` ENUM(
  'DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE',
  'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE',
  'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE',
  'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT'
) NOT NULL;

ALTER TABLE `recovery_audits` MODIFY `scenario` ENUM(
  'DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE',
  'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE',
  'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE',
  'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT'
) NULL;

-- CreateTable disaster_scenarios
CREATE TABLE `disaster_scenarios` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE', 'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE', 'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE', 'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT') NOT NULL,
    `severity` VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    `description` TEXT NOT NULL,
    `rpo_minutes` INTEGER NOT NULL DEFAULT 15,
    `rto_minutes` INTEGER NOT NULL DEFAULT 60,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `disaster_scenarios_code_key`(`code`),
    INDEX `disaster_scenarios_scenario_is_active_idx`(`scenario`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable recovery_runbooks
CREATE TABLE `recovery_runbooks` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `scenario_id` CHAR(36) NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE', 'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE', 'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE', 'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT') NULL,
    `steps` JSON NOT NULL,
    `emergency_contacts` JSON NULL,
    `escalation_matrix` JSON NULL,
    `approval_required` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `recovery_runbooks_code_key`(`code`),
    INDEX `recovery_runbooks_scenario_is_active_idx`(`scenario`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable recovery_executions
CREATE TABLE `recovery_executions` (
    `id` CHAR(36) NOT NULL,
    `runbook_id` CHAR(36) NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE', 'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE', 'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE', 'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT') NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `rpo_achieved` INTEGER NULL,
    `rto_achieved` INTEGER NULL,
    `passed` BOOLEAN NULL,
    `findings` TEXT NULL,
    `executed_by_id` CHAR(36) NULL,
    `approved_by_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `recovery_executions_scenario_status_idx`(`scenario`, `status`),
    INDEX `recovery_executions_runbook_id_created_at_idx`(`runbook_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable failover_executions
CREATE TABLE `failover_executions` (
    `id` CHAR(36) NOT NULL,
    `failover_type` ENUM('DNS', 'TRAFFIC_SWITCH', 'BLUE_GREEN', 'READ_REPLICA_PROMOTION') NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `primary_env` VARCHAR(64) NOT NULL,
    `standby_env` VARCHAR(64) NOT NULL,
    `dns_updated` BOOLEAN NOT NULL DEFAULT false,
    `traffic_switched` BOOLEAN NOT NULL DEFAULT false,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `failback_at` DATETIME(3) NULL,
    `executed_by_id` CHAR(36) NULL,
    `findings` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `failover_executions_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable dr_drills
CREATE TABLE `dr_drills` (
    `id` CHAR(36) NOT NULL,
    `drill_type` ENUM('MONTHLY', 'QUARTERLY', 'ANNUAL') NOT NULL,
    `scenario` ENUM('DATABASE_FAILURE', 'APPLICATION_FAILURE', 'SERVER_FAILURE', 'LOAD_BALANCER_FAILURE', 'REDIS_FAILURE', 'STORAGE_FAILURE', 'AI_SERVICE_FAILURE', 'NOTIFICATION_PROVIDER_FAILURE', 'REGION_FAILURE', 'CLOUD_FAILURE', 'SECURITY_INCIDENT', 'CREDENTIAL_LEAK', 'RANSOMWARE', 'ACCIDENTAL_DELETION', 'FAILED_PRODUCTION_DEPLOYMENT') NOT NULL,
    `status` ENUM('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduled_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `rpo_achieved` INTEGER NULL,
    `rto_achieved` INTEGER NULL,
    `passed` BOOLEAN NULL,
    `findings` TEXT NULL,
    `report` JSON NULL,
    `executed_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `dr_drills_drill_type_status_idx`(`drill_type`, `status`),
    INDEX `dr_drills_scenario_created_at_idx`(`scenario`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable dr_reports
CREATE TABLE `dr_reports` (
    `id` CHAR(36) NOT NULL,
    `report_type` ENUM('DR_READINESS', 'RECOVERY', 'FAILOVER', 'BUSINESS_CONTINUITY') NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `coverage_pct` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(500) NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `dr_reports_report_type_generated_at_idx`(`report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable recovery_audit_logs
CREATE TABLE `recovery_audit_logs` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `compliance` VARCHAR(64) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `recovery_audit_logs_action_created_at_idx`(`action`, `created_at`),
    INDEX `recovery_audit_logs_execution_id_idx`(`execution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKeys
ALTER TABLE `recovery_runbooks` ADD CONSTRAINT `recovery_runbooks_scenario_id_fkey` FOREIGN KEY (`scenario_id`) REFERENCES `disaster_scenarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `recovery_executions` ADD CONSTRAINT `recovery_executions_runbook_id_fkey` FOREIGN KEY (`runbook_id`) REFERENCES `recovery_runbooks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `recovery_executions` ADD CONSTRAINT `recovery_executions_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `recovery_executions` ADD CONSTRAINT `recovery_executions_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `failover_executions` ADD CONSTRAINT `failover_executions_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `dr_drills` ADD CONSTRAINT `dr_drills_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `recovery_audit_logs` ADD CONSTRAINT `recovery_audit_logs_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `recovery_executions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `recovery_audit_logs` ADD CONSTRAINT `recovery_audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
