-- CreateTable
CREATE TABLE `production_environments` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `status` ENUM('PROVISIONING', 'LIVE', 'DEGRADED', 'MAINTENANCE', 'INCIDENT') NOT NULL DEFAULT 'LIVE',
    `api_url` VARCHAR(500) NULL,
    `admin_url` VARCHAR(500) NULL,
    `customer_url` VARCHAR(500) NULL,
    `partner_url` VARCHAR(500) NULL,
    `region` VARCHAR(32) NOT NULL DEFAULT 'ap-south-1',
    `version` VARCHAR(64) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `availability` DOUBLE NULL DEFAULT 99.9,
    `go_live_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `production_environments_code_key`(`code`),
    INDEX `production_environments_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_deployments` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `component` VARCHAR(64) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `strategy` VARCHAR(32) NOT NULL DEFAULT 'rolling',
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `deployed_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `validation_report` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `production_deployments_environment_id_created_at_idx`(`environment_id`, `created_at`),
    INDEX `production_deployments_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `release_records` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `version` VARCHAR(32) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `branch` VARCHAR(128) NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'RELEASED', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PLANNED',
    `changelog` TEXT NULL,
    `uat_signed_off` BOOLEAN NOT NULL DEFAULT false,
    `go_live_approved` BOOLEAN NOT NULL DEFAULT false,
    `released_by_id` CHAR(36) NULL,
    `released_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `release_records_environment_id_status_idx`(`environment_id`, `status`),
    INDEX `release_records_version_created_at_idx`(`version`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incident_records` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'INVESTIGATING', 'MITIGATED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `description` TEXT NULL,
    `root_cause` TEXT NULL,
    `resolution` TEXT NULL,
    `assigned_to_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `incident_records_environment_id_status_severity_idx`(`environment_id`, `status`, `severity`),
    INDEX `incident_records_severity_started_at_idx`(`severity`, `started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_audits` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `actor_id` CHAR(36) NULL,
    `compliance` VARCHAR(64) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `production_audits_action_created_at_idx`(`action`, `created_at`),
    INDEX `production_audits_compliance_created_at_idx`(`compliance`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `production_deployments` ADD CONSTRAINT `production_deployments_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `production_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_deployments` ADD CONSTRAINT `production_deployments_deployed_by_id_fkey` FOREIGN KEY (`deployed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_records` ADD CONSTRAINT `release_records_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `production_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_records` ADD CONSTRAINT `release_records_released_by_id_fkey` FOREIGN KEY (`released_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incident_records` ADD CONSTRAINT `incident_records_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `production_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incident_records` ADD CONSTRAINT `incident_records_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_audits` ADD CONSTRAINT `production_audits_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `production_environments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_audits` ADD CONSTRAINT `production_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
