-- CreateTable: KuberOne Analytics Dashboard Engine

CREATE TABLE `metric_definitions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category` ENUM('LEAD', 'APPLICATION', 'DISBURSEMENT', 'REVENUE', 'COMMISSION', 'PARTNER', 'EXECUTIVE', 'SUPPORT', 'AI', 'NOTIFICATION', 'DOCUMENT', 'CUSTOMER', 'REFERRAL') NOT NULL,
    `description` TEXT NULL,
    `unit` VARCHAR(30) NULL,
    `formula` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `metric_definitions_code_key`(`code`),
    INDEX `metric_definitions_category_is_active_idx`(`category`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `metric_values` (
    `id` CHAR(36) NOT NULL,
    `metric_definition_id` CHAR(36) NOT NULL,
    `snapshot_date` DATE NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `value` DECIMAL(18, 4) NOT NULL,
    `dimensions` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `metric_values_snapshot_date_branch_id_region_id_idx`(`snapshot_date`, `branch_id`, `region_id`),
    UNIQUE INDEX `metric_values_metric_definition_id_snapshot_date_branch_id_region_id_partner_id_employee_id_key`(`metric_definition_id`, `snapshot_date`, `branch_id`, `region_id`, `partner_id`, `employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dashboards` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `dashboard_type` ENUM('SYSTEM', 'BUSINESS', 'OPERATIONS', 'SALES', 'CREDIT', 'MANAGEMENT') NOT NULL,
    `description` TEXT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `layout` JSON NULL,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dashboards_code_key`(`code`),
    INDEX `dashboards_dashboard_type_is_active_idx`(`dashboard_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dashboard_widgets` (
    `id` CHAR(36) NOT NULL,
    `dashboard_id` CHAR(36) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `chart_type` ENUM('LINE', 'BAR', 'AREA', 'PIE', 'TABLE', 'SCORECARD', 'TREND') NOT NULL,
    `metric_code` VARCHAR(80) NULL,
    `config` JSON NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `width` INTEGER NOT NULL DEFAULT 6,
    `height` INTEGER NOT NULL DEFAULT 4,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dashboard_widgets_dashboard_id_position_idx`(`dashboard_id`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dashboard_filters` (
    `id` CHAR(36) NOT NULL,
    `dashboard_id` CHAR(36) NOT NULL,
    `filter_key` VARCHAR(80) NOT NULL,
    `filter_value` VARCHAR(255) NULL,
    `time_preset` ENUM('TODAY', 'YESTERDAY', 'THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER', 'THIS_YEAR', 'CUSTOM') NULL,
    `from_date` DATETIME(3) NULL,
    `to_date` DATETIME(3) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dashboard_filters_dashboard_id_idx`(`dashboard_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `analytics_snapshots` (
    `id` CHAR(36) NOT NULL,
    `snapshot_date` DATE NOT NULL,
    `dashboard_type` ENUM('SYSTEM', 'BUSINESS', 'OPERATIONS', 'SALES', 'CREDIT', 'MANAGEMENT') NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `payload` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_snapshots_snapshot_date_idx`(`snapshot_date`),
    UNIQUE INDEX `analytics_snapshots_snapshot_date_dashboard_type_branch_id_region_id_partner_id_key`(`snapshot_date`, `dashboard_type`, `branch_id`, `region_id`, `partner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `analytics_reports` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `report_type` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `analytics_reports_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `report_executions` (
    `id` CHAR(36) NOT NULL,
    `report_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `format` ENUM('CSV', 'EXCEL', 'PDF') NOT NULL DEFAULT 'CSV',
    `parameters` JSON NULL,
    `result_url` VARCHAR(500) NULL,
    `row_count` INTEGER NULL,
    `error_message` TEXT NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `executed_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `report_executions_report_id_status_created_at_idx`(`report_id`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `analytics_schedules` (
    `id` CHAR(36) NOT NULL,
    `report_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    `cron_expression` VARCHAR(80) NULL,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    `recipients` JSON NULL,
    `format` ENUM('CSV', 'EXCEL', 'PDF') NOT NULL DEFAULT 'CSV',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_run_at` DATETIME(3) NULL,
    `next_run_at` DATETIME(3) NULL,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `analytics_schedules_is_active_next_run_at_idx`(`is_active`, `next_run_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `analytics_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(80) NOT NULL,
    `resource` VARCHAR(80) NOT NULL,
    `resource_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `analytics_audits_action_created_at_idx`(`action`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `metric_values` ADD CONSTRAINT `metric_values_metric_definition_id_fkey` FOREIGN KEY (`metric_definition_id`) REFERENCES `metric_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `dashboard_widgets` ADD CONSTRAINT `dashboard_widgets_dashboard_id_fkey` FOREIGN KEY (`dashboard_id`) REFERENCES `dashboards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `dashboard_filters` ADD CONSTRAINT `dashboard_filters_dashboard_id_fkey` FOREIGN KEY (`dashboard_id`) REFERENCES `dashboards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `analytics_reports` ADD CONSTRAINT `analytics_reports_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `report_executions` ADD CONSTRAINT `report_executions_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `analytics_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `report_executions` ADD CONSTRAINT `report_executions_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `analytics_schedules` ADD CONSTRAINT `analytics_schedules_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `analytics_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `analytics_schedules` ADD CONSTRAINT `analytics_schedules_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `analytics_audits` ADD CONSTRAINT `analytics_audits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
