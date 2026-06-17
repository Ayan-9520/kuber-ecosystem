-- Google Play Store Deployment Platform

CREATE TABLE `play_store_listings` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `package_name` VARCHAR(128) NOT NULL,
    `app_name` VARCHAR(128) NOT NULL,
    `short_description` VARCHAR(80) NOT NULL,
    `full_description` TEXT NOT NULL,
    `keywords` VARCHAR(500) NULL,
    `category` VARCHAR(64) NOT NULL DEFAULT 'FINANCE',
    `secondary_category` VARCHAR(64) NULL,
    `privacy_policy_url` VARCHAR(500) NOT NULL,
    `terms_url` VARCHAR(500) NOT NULL,
    `contact_email` VARCHAR(255) NULL,
    `contact_website` VARCHAR(500) NULL,
    `listing_complete` BOOLEAN NOT NULL DEFAULT false,
    `assets_complete` BOOLEAN NOT NULL DEFAULT false,
    `compliance_complete` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `play_store_listings_app_key`(`app`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `play_store_releases` (
    `id` CHAR(36) NOT NULL,
    `listing_id` CHAR(36) NOT NULL,
    `version_name` VARCHAR(32) NOT NULL,
    `version_code` INTEGER NOT NULL,
    `track` ENUM('INTERNAL', 'CLOSED', 'OPEN', 'PRODUCTION') NOT NULL DEFAULT 'INTERNAL',
    `status` ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'ROLLED_OUT', 'HALTED', 'ROLLED_BACK') NOT NULL DEFAULT 'DRAFT',
    `rollout_percent` INTEGER NOT NULL DEFAULT 0,
    `release_notes` TEXT NULL,
    `aab_artifact_url` VARCHAR(500) NULL,
    `play_console_url` VARCHAR(500) NULL,
    `published_by_id` CHAR(36) NULL,
    `published_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `play_store_releases_listing_id_track_status_created_at_idx`(`listing_id`, `track`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `play_store_reports` (
    `id` CHAR(36) NOT NULL,
    `listing_id` CHAR(36) NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `report_type` ENUM('STORE_READINESS', 'COMPLIANCE', 'RELEASE', 'LAUNCH', 'PRE_LAUNCH') NOT NULL,
    `score` DOUBLE NULL,
    `readiness_pct` DOUBLE NULL,
    `summary` TEXT NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `play_store_reports_app_report_type_generated_at_idx`(`app`, `report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `play_store_audits` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `play_store_audits_app_created_at_idx`(`app`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `play_store_releases` ADD CONSTRAINT `play_store_releases_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `play_store_listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `play_store_reports` ADD CONSTRAINT `play_store_reports_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `play_store_listings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
