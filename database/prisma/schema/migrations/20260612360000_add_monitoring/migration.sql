-- Production Monitoring Platform

CREATE TABLE `monitoring_alert_rules` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `component` ENUM('SYSTEM', 'APPLICATION', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'AUTH', 'BUSINESS', 'ANALYTICS', 'INFRASTRUCTURE') NOT NULL,
    `metric` VARCHAR(100) NOT NULL,
    `condition` VARCHAR(32) NOT NULL,
    `threshold` DECIMAL(12, 4) NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL DEFAULT 'MEDIUM',
    `channels` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `cooldown_sec` INTEGER NOT NULL DEFAULT 300,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `monitoring_alert_rules_code_key`(`code`),
    INDEX `monitoring_alert_rules_component_is_active_idx`(`component`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `monitoring_alerts` (
    `id` CHAR(36) NOT NULL,
    `rule_id` CHAR(36) NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `component` ENUM('SYSTEM', 'APPLICATION', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'AUTH', 'BUSINESS', 'ANALYTICS', 'INFRASTRUCTURE') NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL,
    `status` ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SILENCED') NOT NULL DEFAULT 'OPEN',
    `metric` VARCHAR(100) NOT NULL,
    `metric_value` DECIMAL(12, 4) NOT NULL,
    `threshold` DECIMAL(12, 4) NOT NULL,
    `channels` JSON NULL,
    `metadata` JSON NULL,
    `acknowledged_by` CHAR(36) NULL,
    `acknowledged_at` DATETIME(3) NULL,
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `monitoring_alerts_code_key`(`code`),
    INDEX `monitoring_alerts_status_severity_idx`(`status`, `severity`),
    INDEX `monitoring_alerts_component_created_at_idx`(`component`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `monitoring_sla_snapshots` (
    `id` CHAR(36) NOT NULL,
    `sla_type` ENUM('AVAILABILITY', 'UPTIME', 'RESPONSE_TIME', 'SUPPORT', 'NOTIFICATION') NOT NULL,
    `target_percent` DECIMAL(5, 2) NOT NULL,
    `actual_percent` DECIMAL(5, 2) NOT NULL,
    `period_start` DATETIME(3) NOT NULL,
    `period_end` DATETIME(3) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_sla_snapshots_sla_type_period_start_idx`(`sla_type`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `monitoring_metric_snapshots` (
    `id` CHAR(36) NOT NULL,
    `component` ENUM('SYSTEM', 'APPLICATION', 'DATABASE', 'QUEUE', 'AI', 'NOTIFICATION', 'AUTH', 'BUSINESS', 'ANALYTICS', 'INFRASTRUCTURE') NOT NULL,
    `metric` VARCHAR(100) NOT NULL,
    `value` DECIMAL(16, 4) NOT NULL,
    `unit` VARCHAR(32) NOT NULL,
    `labels` JSON NULL,
    `sampled_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `monitoring_metric_snapshots_component_metric_sampled_at_idx`(`component`, `metric`, `sampled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monitoring_alerts` ADD CONSTRAINT `monitoring_alerts_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `monitoring_alert_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `monitoring_alerts` ADD CONSTRAINT `monitoring_alerts_acknowledged_by_fkey` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `monitoring_alerts` ADD CONSTRAINT `monitoring_alerts_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
