-- Apple App Store Deployment Platform

CREATE TABLE `app_store_listings` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `bundle_id` VARCHAR(128) NOT NULL,
    `app_name` VARCHAR(128) NOT NULL,
    `subtitle` VARCHAR(30) NULL,
    `keywords` VARCHAR(500) NULL,
    `description` TEXT NOT NULL,
    `promotional_text` VARCHAR(170) NULL,
    `support_url` VARCHAR(500) NOT NULL,
    `marketing_url` VARCHAR(500) NULL,
    `privacy_policy_url` VARCHAR(500) NOT NULL,
    `terms_url` VARCHAR(500) NOT NULL,
    `primary_category` VARCHAR(64) NOT NULL DEFAULT 'FINANCE',
    `secondary_category` VARCHAR(64) NULL,
    `age_rating` VARCHAR(16) NULL,
    `listing_complete` BOOLEAN NOT NULL DEFAULT false,
    `assets_complete` BOOLEAN NOT NULL DEFAULT false,
    `compliance_complete` BOOLEAN NOT NULL DEFAULT false,
    `review_notes` TEXT NULL,
    `demo_account` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `app_store_listings_app_key`(`app`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `app_store_releases` (
    `id` CHAR(36) NOT NULL,
    `listing_id` CHAR(36) NOT NULL,
    `version_name` VARCHAR(32) NOT NULL,
    `build_number` VARCHAR(32) NOT NULL,
    `track` ENUM('TESTFLIGHT_INTERNAL', 'TESTFLIGHT_EXTERNAL', 'APP_STORE') NOT NULL DEFAULT 'TESTFLIGHT_INTERNAL',
    `status` ENUM('DRAFT', 'PROCESSING', 'IN_REVIEW', 'READY_FOR_SALE', 'PHASED_RELEASE', 'REJECTED', 'REMOVED') NOT NULL DEFAULT 'DRAFT',
    `phased_release` BOOLEAN NOT NULL DEFAULT true,
    `rollout_day` INTEGER NULL,
    `release_notes` TEXT NULL,
    `ipa_artifact_url` VARCHAR(500) NULL,
    `testflight_url` VARCHAR(500) NULL,
    `published_by_id` CHAR(36) NULL,
    `published_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `app_store_releases_listing_id_track_status_created_at_idx`(`listing_id`, `track`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `app_store_reports` (
    `id` CHAR(36) NOT NULL,
    `listing_id` CHAR(36) NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `report_type` ENUM('STORE_READINESS', 'COMPLIANCE', 'REVIEW_READINESS', 'RELEASE', 'LAUNCH', 'PRE_SUBMISSION') NOT NULL,
    `score` DOUBLE NULL,
    `readiness_pct` DOUBLE NULL,
    `summary` TEXT NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `app_store_reports_app_report_type_generated_at_idx`(`app`, `report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `app_store_audits` (
    `id` CHAR(36) NOT NULL,
    `app` ENUM('CUSTOMER', 'DSA') NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `app_store_audits_app_created_at_idx`(`app`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `app_store_releases` ADD CONSTRAINT `app_store_releases_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `app_store_listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `app_store_reports` ADD CONSTRAINT `app_store_reports_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `app_store_listings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
