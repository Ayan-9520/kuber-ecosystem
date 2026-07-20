-- Website visitor interest captures (soft popup from kuberfinserve)

CREATE TABLE IF NOT EXISTS `website_visitors` (
    `id` CHAR(36) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NULL,
    `phone` VARCHAR(15) NULL,
    `email` VARCHAR(255) NULL,
    `page_url` VARCHAR(500) NULL,
    `referrer` VARCHAR(500) NULL,
    `utm_source` VARCHAR(120) NULL,
    `utm_medium` VARCHAR(120) NULL,
    `utm_campaign` VARCHAR(120) NULL,
    `session_id` VARCHAR(64) NULL,
    `external_visitor_id` VARCHAR(64) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `website_visitors_external_visitor_id_key`(`external_visitor_id`),
    INDEX `website_visitors_city_idx`(`city`),
    INDEX `website_visitors_phone_idx`(`phone`),
    INDEX `website_visitors_session_id_created_at_idx`(`session_id`, `created_at`),
    INDEX `website_visitors_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
