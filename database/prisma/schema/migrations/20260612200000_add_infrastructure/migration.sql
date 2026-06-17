-- CreateTable
CREATE TABLE `infrastructure_environments` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `type` ENUM('DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION') NOT NULL,
    `region` VARCHAR(32) NOT NULL,
    `cloud` VARCHAR(16) NOT NULL DEFAULT 'aws',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `vpc_cidr` VARCHAR(32) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `infrastructure_environments_code_key`(`code`),
    INDEX `infrastructure_environments_type_is_active_idx`(`type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infrastructure_services` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `service_type` ENUM('API', 'WORKER', 'SCHEDULER', 'NOTIFICATION_WORKER', 'AI_WORKER', 'NGINX', 'ALB', 'REDIS', 'DATABASE', 'S3', 'MONITORING', 'GRAFANA', 'PROMETHEUS', 'LOKI', 'OTEL') NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `endpoint` VARCHAR(500) NULL,
    `status` ENUM('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `version` VARCHAR(64) NULL,
    `replicas` INTEGER NOT NULL DEFAULT 1,
    `last_checked_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `infrastructure_services_environment_id_service_type_idx`(`environment_id`, `service_type`),
    INDEX `infrastructure_services_status_last_checked_at_idx`(`status`, `last_checked_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infrastructure_domains` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `hostname` VARCHAR(255) NOT NULL,
    `service_type` ENUM('API', 'WORKER', 'SCHEDULER', 'NOTIFICATION_WORKER', 'AI_WORKER', 'NGINX', 'ALB', 'REDIS', 'DATABASE', 'S3', 'MONITORING', 'GRAFANA', 'PROMETHEUS', 'LOKI', 'OTEL') NOT NULL,
    `ssl_provider` ENUM('LETS_ENCRYPT', 'AWS_ACM', 'CLOUDFLARE', 'MANUAL') NOT NULL DEFAULT 'AWS_ACM',
    `ssl_expires_at` DATETIME(3) NULL,
    `hsts_enabled` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `infrastructure_domains_hostname_idx`(`hostname`),
    UNIQUE INDEX `infrastructure_domains_environment_id_hostname_key`(`environment_id`, `hostname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infrastructure_health_snapshots` (
    `id` CHAR(36) NOT NULL,
    `environment_id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NULL,
    `status` ENUM('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN') NOT NULL,
    `latency_ms` INTEGER NULL,
    `cpu_percent` DOUBLE NULL,
    `memory_percent` DOUBLE NULL,
    `details` JSON NULL,
    `checked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `infrastructure_health_snapshots_environment_id_checked_at_idx`(`environment_id`, `checked_at`),
    INDEX `infrastructure_health_snapshots_service_id_checked_at_idx`(`service_id`, `checked_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `infrastructure_configs` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(128) NOT NULL,
    `category` VARCHAR(64) NOT NULL,
    `value` TEXT NOT NULL,
    `is_secret` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `infrastructure_configs_key_key`(`key`),
    INDEX `infrastructure_configs_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `infrastructure_services` ADD CONSTRAINT `infrastructure_services_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `infrastructure_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infrastructure_domains` ADD CONSTRAINT `infrastructure_domains_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `infrastructure_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infrastructure_health_snapshots` ADD CONSTRAINT `infrastructure_health_snapshots_environment_id_fkey` FOREIGN KEY (`environment_id`) REFERENCES `infrastructure_environments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `infrastructure_health_snapshots` ADD CONSTRAINT `infrastructure_health_snapshots_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `infrastructure_services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
