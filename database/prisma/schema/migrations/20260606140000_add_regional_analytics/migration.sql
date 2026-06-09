-- CreateEnum
CREATE TYPE `RegionalPeriodType` AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE `RegionalRankingType` AS ENUM ('REGION', 'BRANCH', 'PRODUCT', 'PARTNER', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE `RegionalMetricCategory` AS ENUM ('OVERVIEW', 'LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH');

-- CreateTable
CREATE TABLE `regional_metrics` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `category` ENUM('OVERVIEW', 'LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `branch_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `lender_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `value` DECIMAL(18, 4) NOT NULL,
    `target_value` DECIMAL(18, 4) NULL,
    `unit` VARCHAR(30) NULL,
    `dimensions` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `regional_metrics_region_id_period_type_period_start_idx`(`region_id`, `period_type`, `period_start`),
    INDEX `regional_metrics_category_period_start_idx`(`category`, `period_start`),
    INDEX `regional_metrics_metric_code_period_start_idx`(`metric_code`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_targets` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `category` ENUM('OVERVIEW', 'LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH') NOT NULL,
    `target_value` DECIMAL(18, 4) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `product_id` CHAR(36) NULL,
    `assigned_by_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `regional_targets_region_id_period_type_is_active_idx`(`region_id`, `period_type`, `is_active`),
    INDEX `regional_targets_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_performances` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `revenue_score` DECIMAL(5, 2) NOT NULL,
    `growth_score` DECIMAL(5, 2) NOT NULL,
    `operations_score` DECIMAL(5, 2) NOT NULL,
    `compliance_score` DECIMAL(5, 2) NOT NULL,
    `customer_score` DECIMAL(5, 2) NOT NULL,
    `ai_adoption_score` DECIMAL(5, 2) NOT NULL,
    `overall_score` DECIMAL(5, 2) NOT NULL,
    `breakdown` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `regional_performances_region_id_period_type_period_start_idx`(`region_id`, `period_type`, `period_start`),
    INDEX `regional_performances_overall_score_idx`(`overall_score`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_forecasts` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `forecast_date` DATE NOT NULL,
    `predicted_value` DECIMAL(18, 4) NOT NULL,
    `confidence` DECIMAL(5, 2) NULL,
    `model_version` VARCHAR(30) NULL,
    `product_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `regional_forecasts_region_id_metric_code_forecast_date_idx`(`region_id`, `metric_code`, `forecast_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_rankings` (
    `id` CHAR(36) NOT NULL,
    `ranking_type` ENUM('REGION', 'BRANCH', 'PRODUCT', 'PARTNER', 'EXECUTIVE') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `region_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `rank` INT NOT NULL,
    `score` DECIMAL(8, 2) NOT NULL,
    `metrics` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `regional_rankings_ranking_type_period_type_period_start_rank_idx`(`ranking_type`, `period_type`, `period_start`, `rank`),
    INDEX `regional_rankings_region_id_period_type_idx`(`region_id`, `period_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_analytics_snapshots` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NULL,
    `snapshot_date` DATE NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `regional_analytics_snapshots_snapshot_date_region_id_idx`(`snapshot_date`, `region_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_analytics_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(80) NOT NULL,
    `resource` VARCHAR(80) NOT NULL,
    `resource_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `regional_analytics_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `regional_analytics_audits_action_created_at_idx`(`action`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `regional_metrics` ADD CONSTRAINT `regional_metrics_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_targets` ADD CONSTRAINT `regional_targets_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `regional_targets` ADD CONSTRAINT `regional_targets_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_performances` ADD CONSTRAINT `regional_performances_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_forecasts` ADD CONSTRAINT `regional_forecasts_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_rankings` ADD CONSTRAINT `regional_rankings_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `regional_rankings` ADD CONSTRAINT `regional_rankings_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_analytics_snapshots` ADD CONSTRAINT `regional_analytics_snapshots_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regional_analytics_audits` ADD CONSTRAINT `regional_analytics_audits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
