-- CreateTable
CREATE TABLE `branch_metrics` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `category` ENUM('LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
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
    INDEX `branch_metrics_branch_id_period_type_period_start_idx`(`branch_id`, `period_type`, `period_start`),
    INDEX `branch_metrics_region_id_category_period_start_idx`(`region_id`, `category`, `period_start`),
    INDEX `branch_metrics_metric_code_period_start_idx`(`metric_code`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_targets` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `category` ENUM('LEAD', 'APPLICATION', 'REVENUE', 'PRODUCT', 'EXECUTIVE', 'PARTNER', 'COMMISSION', 'SUPPORT', 'AI', 'GROWTH') NOT NULL,
    `target_value` DECIMAL(18, 4) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `product_id` CHAR(36) NULL,
    `assigned_by_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `branch_targets_branch_id_period_type_is_active_idx`(`branch_id`, `period_type`, `is_active`),
    INDEX `branch_targets_region_id_category_idx`(`region_id`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_performances` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `growth_score` DECIMAL(5, 2) NOT NULL,
    `revenue_score` DECIMAL(5, 2) NOT NULL,
    `operations_score` DECIMAL(5, 2) NOT NULL,
    `compliance_score` DECIMAL(5, 2) NOT NULL,
    `customer_score` DECIMAL(5, 2) NOT NULL,
    `overall_score` DECIMAL(5, 2) NOT NULL,
    `breakdown` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `branch_performances_branch_id_period_type_period_start_idx`(`branch_id`, `period_type`, `period_start`),
    INDEX `branch_performances_region_id_overall_score_idx`(`region_id`, `overall_score`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_forecasts` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
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
    INDEX `branch_forecasts_branch_id_metric_code_forecast_date_idx`(`branch_id`, `metric_code`, `forecast_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_rankings` (
    `id` CHAR(36) NOT NULL,
    `ranking_type` ENUM('BRANCH', 'REGIONAL', 'PRODUCT', 'REVENUE') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `rank` INTEGER NOT NULL,
    `score` DECIMAL(8, 2) NOT NULL,
    `metrics` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    INDEX `branch_rankings_type_period_rank_idx`(`ranking_type`, `period_type`, `period_start`, `rank`),
    INDEX `branch_rankings_branch_id_period_type_idx`(`branch_id`, `period_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_analytics_snapshots` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `snapshot_date` DATE NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `branch_analytics_snapshots_snapshot_date_branch_id_idx`(`snapshot_date`, `branch_id`),
    INDEX `branch_analytics_snapshots_region_id_snapshot_date_idx`(`region_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branch_analytics_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(80) NOT NULL,
    `resource` VARCHAR(80) NOT NULL,
    `resource_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `branch_analytics_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `branch_analytics_audits_action_created_at_idx`(`action`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branch_metrics` ADD CONSTRAINT `branch_metrics_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_targets` ADD CONSTRAINT `branch_targets_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_targets` ADD CONSTRAINT `branch_targets_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_performances` ADD CONSTRAINT `branch_performances_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_forecasts` ADD CONSTRAINT `branch_forecasts_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_rankings` ADD CONSTRAINT `branch_rankings_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_analytics_snapshots` ADD CONSTRAINT `branch_analytics_snapshots_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branch_analytics_audits` ADD CONSTRAINT `branch_analytics_audits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
