-- CreateTable
CREATE TABLE `backend_deployments` (
    `id` CHAR(36) NOT NULL,
    `version_id` CHAR(36) NULL,
    `domain` VARCHAR(255) NOT NULL DEFAULT 'api.kuberone.com',
    `strategy` ENUM('ROLLING', 'BLUE_GREEN', 'CANARY') NOT NULL DEFAULT 'ROLLING',
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `version` VARCHAR(64) NOT NULL,
    `commit_sha` VARCHAR(64) NULL,
    `branch` VARCHAR(128) NULL,
    `deployed_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `validation_report` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backend_deployments_status_created_at_idx`(`status`, `created_at`),
    INDEX `backend_deployments_version_id_idx`(`version_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployment_versions` (
    `id` CHAR(36) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `status` ENUM('DRAFT', 'CANDIDATE', 'RELEASED', 'SUPERSEDED', 'ROLLED_BACK') NOT NULL DEFAULT 'DRAFT',
    `commit_sha` VARCHAR(64) NULL,
    `changelog` TEXT NULL,
    `released_at` DATETIME(3) NULL,
    `released_by_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `deployment_versions_version_key`(`version`),
    INDEX `deployment_versions_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `release_artifacts` (
    `id` CHAR(36) NOT NULL,
    `deployment_id` CHAR(36) NULL,
    `version_id` CHAR(36) NULL,
    `artifact_type` VARCHAR(64) NOT NULL,
    `artifact_url` VARCHAR(500) NULL,
    `checksum` VARCHAR(128) NULL,
    `size_bytes` BIGINT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `release_artifacts_deployment_id_idx`(`deployment_id`),
    INDEX `release_artifacts_version_id_artifact_type_idx`(`version_id`, `artifact_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backend_deployment_audits` (
    `id` CHAR(36) NOT NULL,
    `deployment_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `compliance` VARCHAR(64) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backend_deployment_audits_action_created_at_idx`(`action`, `created_at`),
    INDEX `backend_deployment_audits_deployment_id_idx`(`deployment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_health` (
    `id` CHAR(36) NOT NULL,
    `service_code` VARCHAR(64) NOT NULL,
    `service_name` VARCHAR(128) NOT NULL,
    `status` ENUM('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `last_checked_at` DATETIME(3) NULL,
    `latency_ms` INTEGER NULL,
    `error_message` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_health_service_code_key`(`service_code`),
    INDEX `service_health_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backend_deployment_reports` (
    `id` CHAR(36) NOT NULL,
    `report_type` ENUM('DEPLOYMENT', 'RELEASE', 'HEALTH', 'SECURITY', 'SCALABILITY') NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `readiness_pct` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(500) NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backend_deployment_reports_report_type_generated_at_idx`(`report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `backend_deployments` ADD CONSTRAINT `backend_deployments_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `deployment_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backend_deployments` ADD CONSTRAINT `backend_deployments_deployed_by_id_fkey` FOREIGN KEY (`deployed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployment_versions` ADD CONSTRAINT `deployment_versions_released_by_id_fkey` FOREIGN KEY (`released_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_artifacts` ADD CONSTRAINT `release_artifacts_deployment_id_fkey` FOREIGN KEY (`deployment_id`) REFERENCES `backend_deployments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_artifacts` ADD CONSTRAINT `release_artifacts_version_id_fkey` FOREIGN KEY (`version_id`) REFERENCES `deployment_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backend_deployment_audits` ADD CONSTRAINT `backend_deployment_audits_deployment_id_fkey` FOREIGN KEY (`deployment_id`) REFERENCES `backend_deployments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backend_deployment_audits` ADD CONSTRAINT `backend_deployment_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
