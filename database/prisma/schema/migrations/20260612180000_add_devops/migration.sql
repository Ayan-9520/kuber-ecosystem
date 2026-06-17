-- CreateTable
CREATE TABLE `pipeline_runs` (
    `id` CHAR(36) NOT NULL,
    `pipeline_type` ENUM('PR_VALIDATION', 'BUILD', 'TEST', 'SECURITY', 'STAGING_DEPLOY', 'PRODUCTION_DEPLOY', 'ROLLBACK', 'RELEASE', 'MOBILE', 'DATABASE') NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `pr_number` INTEGER NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `duration_ms` INTEGER NULL,
    `workflow_url` VARCHAR(500) NULL,
    `triggered_by` VARCHAR(128) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pipeline_runs_pipeline_type_status_created_at_idx`(`pipeline_type`, `status`, `created_at`),
    INDEX `pipeline_runs_branch_created_at_idx`(`branch`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployments` (
    `id` CHAR(36) NOT NULL,
    `pipeline_run_id` CHAR(36) NULL,
    `environment` ENUM('DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION') NOT NULL,
    `strategy` ENUM('ROLLING', 'BLUE_GREEN', 'CANARY', 'MANUAL') NOT NULL DEFAULT 'ROLLING',
    `component` VARCHAR(64) NOT NULL,
    `version` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `commit_sha` VARCHAR(64) NULL,
    `deployed_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `deployments_environment_status_created_at_idx`(`environment`, `status`, `created_at`),
    INDEX `deployments_component_created_at_idx`(`component`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployment_executions` (
    `id` CHAR(36) NOT NULL,
    `deployment_id` CHAR(36) NOT NULL,
    `step` VARCHAR(128) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PENDING',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `duration_ms` INTEGER NULL,
    `logs` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `deployment_executions_deployment_id_created_at_idx`(`deployment_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `release_versions` (
    `id` CHAR(36) NOT NULL,
    `version` VARCHAR(32) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `changelog` TEXT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `created_by_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `release_versions_version_key`(`version`),
    INDEX `release_versions_is_published_created_at_idx`(`is_published`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rollback_executions` (
    `id` CHAR(36) NOT NULL,
    `deployment_id` CHAR(36) NULL,
    `from_version` VARCHAR(64) NOT NULL,
    `to_version` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `reason` TEXT NULL,
    `executed_by_id` CHAR(36) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rollback_executions_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deployment_audits` (
    `id` CHAR(36) NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `actor_id` CHAR(36) NULL,
    `environment` VARCHAR(32) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `deployment_audits_action_created_at_idx`(`action`, `created_at`),
    INDEX `deployment_audits_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_pipeline_run_id_fkey` FOREIGN KEY (`pipeline_run_id`) REFERENCES `pipeline_runs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployments` ADD CONSTRAINT `deployments_deployed_by_id_fkey` FOREIGN KEY (`deployed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployment_executions` ADD CONSTRAINT `deployment_executions_deployment_id_fkey` FOREIGN KEY (`deployment_id`) REFERENCES `deployments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `release_versions` ADD CONSTRAINT `release_versions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rollback_executions` ADD CONSTRAINT `rollback_executions_deployment_id_fkey` FOREIGN KEY (`deployment_id`) REFERENCES `deployments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rollback_executions` ADD CONSTRAINT `rollback_executions_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deployment_audits` ADD CONSTRAINT `deployment_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
