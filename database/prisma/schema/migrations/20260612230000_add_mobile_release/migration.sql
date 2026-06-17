-- Mobile Release & Android Build Platform

CREATE TABLE `mobile_releases` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `version_name` VARCHAR(32) NOT NULL,
    `version_code` INTEGER NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'RELEASED', 'FAILED', 'ROLLED_BACK') NOT NULL DEFAULT 'PLANNED',
    `track` VARCHAR(32) NOT NULL DEFAULT 'internal',
    `release_notes` TEXT NULL,
    `play_store_ready` BOOLEAN NOT NULL DEFAULT false,
    `readiness_score` DOUBLE NULL,
    `security_score` DOUBLE NULL,
    `performance_score` DOUBLE NULL,
    `uat_signed_off` BOOLEAN NOT NULL DEFAULT false,
    `released_by_id` CHAR(36) NULL,
    `released_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `mobile_releases_app_status_created_at_idx`(`app`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mobile_builds` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `environment` ENUM('DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION') NOT NULL,
    `build_format` ENUM('APK', 'AAB') NOT NULL,
    `version_name` VARCHAR(32) NOT NULL,
    `version_code` INTEGER NOT NULL,
    `build_number` VARCHAR(32) NULL,
    `status` ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `branch` VARCHAR(128) NULL,
    `commit_sha` VARCHAR(64) NULL,
    `artifact_url` VARCHAR(500) NULL,
    `artifact_size` INTEGER NULL,
    `package_id` VARCHAR(128) NULL,
    `hermes_enabled` BOOLEAN NOT NULL DEFAULT true,
    `proguard_enabled` BOOLEAN NOT NULL DEFAULT false,
    `signed` BOOLEAN NOT NULL DEFAULT false,
    `split_apk_ready` BOOLEAN NOT NULL DEFAULT false,
    `report` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `release_id` CHAR(36) NULL,

    INDEX `mobile_builds_app_environment_status_created_at_idx`(`app`, `environment`, `status`, `created_at`),
    INDEX `mobile_builds_version_name_version_code_idx`(`version_name`, `version_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mobile_release_audits` (
    `id` CHAR(36) NOT NULL,
    `release_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mobile_release_audits_release_id_created_at_idx`(`release_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `mobile_builds` ADD CONSTRAINT `mobile_builds_release_id_fkey` FOREIGN KEY (`release_id`) REFERENCES `mobile_releases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `mobile_release_audits` ADD CONSTRAINT `mobile_release_audits_release_id_fkey` FOREIGN KEY (`release_id`) REFERENCES `mobile_releases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
