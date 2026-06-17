-- CreateTable
CREATE TABLE `staging_environments` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `status` ENUM('PROVISIONING', 'ACTIVE', 'VALIDATING', 'DEGRADED', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    `api_url` VARCHAR(500) NULL,
    `admin_url` VARCHAR(500) NULL,
    `customer_url` VARCHAR(500) NULL,
    `partner_url` VARCHAR(500) NULL,
    `database_url` VARCHAR(500) NULL,
    `redis_url` VARCHAR(500) NULL,
    `s3_bucket` VARCHAR(128) NULL,
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `version` VARCHAR(64) NULL,
    `masked_data` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staging_environments_code_key`(`code`),
    INDEX `staging_environments_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `environment_deployments` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `component` VARCHAR(64) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `status` ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `build_status` ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `test_status` ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `migration_status` ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `health_status` ENUM('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `deployed_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `report` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `environment_deployments_environment_id_created_at_idx`(`environment_id`, `created_at`),
    INDEX `environment_deployments_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `release_validations` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `release_version` VARCHAR(32) NOT NULL,
    `branch` VARCHAR(128) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `pre_deploy_check` BOOLEAN NOT NULL DEFAULT false,
    `post_deploy_check` BOOLEAN NOT NULL DEFAULT false,
    `rollback_ready` BOOLEAN NOT NULL DEFAULT false,
    `checklist` JSON NULL,
    `validated_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `report` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `release_validations_environment_id_status_idx`(`environment_id`, `status`),
    INDEX `release_validations_release_version_created_at_idx`(`release_version`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staging_audits` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `actor_id` CHAR(36) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `staging_audits_action_created_at_idx`(`action`, `created_at`),
    INDEX `staging_audits_environment_id_created_at_idx`(`environment_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `environment_deployments` ADD CONSTRAINT `environment_deployments_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `staging_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `environment_deployments` ADD CONSTRAINT `environment_deployments_deployed_by_id_fkey` FOREIGN KEY (`deployed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_validations` ADD CONSTRAINT `release_validations_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `staging_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_validations` ADD CONSTRAINT `release_validations_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staging_audits` ADD CONSTRAINT `staging_audits_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `staging_environments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staging_audits` ADD CONSTRAINT `staging_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
