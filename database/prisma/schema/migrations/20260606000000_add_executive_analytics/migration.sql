-- CreateEnum
CREATE TYPE `ExecutiveRoleType` AS ENUM ('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE');

-- CreateEnum
CREATE TYPE `ExecutivePeriodType` AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateTable
CREATE TABLE `executive_metrics` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `value` DECIMAL(18, 4) NOT NULL,
    `target_value` DECIMAL(18, 4) NULL,
    `unit` VARCHAR(30) NULL,
    `dimensions` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `executive_metrics_employee_id_period_type_period_start_idx`(`employee_id`, `period_type`, `period_start`),
    INDEX `executive_metrics_executive_role_period_type_period_start_idx`(`executive_role`, `period_type`, `period_start`),
    INDEX `executive_metrics_metric_code_period_start_idx`(`metric_code`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_targets` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `metric_name` VARCHAR(150) NOT NULL,
    `target_value` DECIMAL(18, 4) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `assigned_by_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `executive_targets_employee_id_period_type_is_active_idx`(`employee_id`, `period_type`, `is_active`),
    INDEX `executive_targets_executive_role_period_type_period_start_idx`(`executive_role`, `period_type`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_performances` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `performance_score` DECIMAL(5, 2) NOT NULL,
    `productivity_score` DECIMAL(5, 2) NOT NULL,
    `quality_score` DECIMAL(5, 2) NOT NULL,
    `compliance_score` DECIMAL(5, 2) NOT NULL,
    `overall_rating` DECIMAL(5, 2) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `breakdown` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `executive_performances_employee_id_period_type_period_start_idx`(`employee_id`, `period_type`, `period_start`),
    INDEX `executive_performances_executive_role_overall_rating_idx`(`executive_role`, `overall_rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_leaderboards` (
    `id` CHAR(36) NOT NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `rank` INTEGER NOT NULL,
    `score` DECIMAL(8, 2) NOT NULL,
    `metrics` JSON NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `executive_leaderboards_executive_role_period_type_period_start_rank_idx`(`executive_role`, `period_type`, `period_start`, `rank`),
    INDEX `executive_leaderboards_employee_id_period_type_idx`(`employee_id`, `period_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_forecasts` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NOT NULL,
    `metric_code` VARCHAR(80) NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `forecast_date` DATE NOT NULL,
    `predicted_value` DECIMAL(18, 4) NOT NULL,
    `confidence` DECIMAL(5, 2) NULL,
    `model_version` VARCHAR(30) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `executive_forecasts_employee_id_metric_code_forecast_date_idx`(`employee_id`, `metric_code`, `forecast_date`),
    INDEX `executive_forecasts_executive_role_period_type_idx`(`executive_role`, `period_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_analytics_snapshots` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NULL,
    `executive_role` ENUM('SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE') NULL,
    `snapshot_date` DATE NOT NULL,
    `period_type` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `executive_analytics_snapshots_snapshot_date_executive_role_idx`(`snapshot_date`, `executive_role`),
    INDEX `executive_analytics_snapshots_employee_id_snapshot_date_idx`(`employee_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `executive_analytics_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(80) NOT NULL,
    `resource` VARCHAR(80) NOT NULL,
    `resource_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `executive_analytics_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `executive_analytics_audits_action_created_at_idx`(`action`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `employees_reports_to_id_idx` ON `employees`(`reports_to_id`);

-- AddForeignKey
ALTER TABLE `executive_metrics` ADD CONSTRAINT `executive_metrics_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_targets` ADD CONSTRAINT `executive_targets_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_targets` ADD CONSTRAINT `executive_targets_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_performances` ADD CONSTRAINT `executive_performances_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_leaderboards` ADD CONSTRAINT `executive_leaderboards_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_forecasts` ADD CONSTRAINT `executive_forecasts_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_analytics_snapshots` ADD CONSTRAINT `executive_analytics_snapshots_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `executive_analytics_audits` ADD CONSTRAINT `executive_analytics_audits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
