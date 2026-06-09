-- KuberOne AI Recommendation Engine

CREATE TABLE `recommendations` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `recommendation_type` ENUM('PRODUCT', 'VARIANT', 'LENDER', 'LOAN_AMOUNT', 'EMI', 'BALANCE_TRANSFER', 'TOP_UP', 'CROSS_SELL', 'FOLLOW_UP', 'DOCUMENT', 'RISK', 'ACTION') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `payload` JSON NULL,
    `rank_score` INTEGER NOT NULL DEFAULT 50,
    `approval_probability` DECIMAL(5, 2) NULL,
    `disbursal_probability` DECIMAL(5, 2) NULL,
    `status` ENUM('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'SUPERSEDED') NOT NULL DEFAULT 'ACTIVE',
    `accepted` BOOLEAN NULL,
    `accepted_at` DATETIME(3) NULL,
    `model_version` VARCHAR(20) NOT NULL DEFAULT 'rec-v1.0',
    `generated_by_id` CHAR(36) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `recommendations_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `recommendations_recommendation_type_status_idx`(`recommendation_type`, `status`),
    INDEX `recommendations_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `recommendation_history` (
    `id` CHAR(36) NOT NULL,
    `recommendation_id` CHAR(36) NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `snapshot` JSON NOT NULL,
    `change_reason` VARCHAR(200) NULL,
    `generated_by_id` CHAR(36) NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_history_entity_type_entity_id_created_at_idx`(`entity_type`, `entity_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `recommendation_rules` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `rule_type` ENUM('STATIC', 'CONFIG', 'DYNAMIC') NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `condition` JSON NOT NULL,
    `score_impact` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 50,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,
    `description` TEXT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recommendation_rules_code_key`(`code`),
    INDEX `recommendation_rules_category_is_active_idx`(`category`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `recommendation_weights` (
    `id` CHAR(36) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `factor` VARCHAR(50) NOT NULL,
    `weight` DECIMAL(5, 4) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recommendation_weights_version_factor_key`(`version`, `factor`),
    INDEX `recommendation_weights_is_active_effective_from_idx`(`is_active`, `effective_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `recommendation_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `action` ENUM('GENERATED', 'ACCEPTED', 'REJECTED', 'RULE_CREATED', 'RULE_UPDATED', 'WEIGHT_UPDATED') NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recommendation_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `recommendation_audits_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `lender_matches` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `lender_id` CHAR(36) NOT NULL,
    `lender_name` VARCHAR(150) NOT NULL,
    `rank_score` INTEGER NOT NULL,
    `rank_position` INTEGER NOT NULL,
    `approval_probability` DECIMAL(5, 2) NULL,
    `expected_roi` DECIMAL(5, 2) NULL,
    `expected_tat_days` INTEGER NULL,
    `estimated_emi` DECIMAL(15, 2) NULL,
    `reason` TEXT NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lender_matches_entity_type_entity_id_rank_position_idx`(`entity_type`, `entity_id`, `rank_position`),
    INDEX `lender_matches_lender_id_idx`(`lender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `product_matches` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NULL,
    `variant_id` CHAR(36) NULL,
    `product_name` VARCHAR(150) NOT NULL,
    `variant_name` VARCHAR(150) NULL,
    `rank_score` INTEGER NOT NULL,
    `rank_position` INTEGER NOT NULL,
    `recommended_amount` DECIMAL(15, 2) NULL,
    `recommended_tenure` INTEGER NULL,
    `recommended_emi` DECIMAL(15, 2) NULL,
    `approval_probability` DECIMAL(5, 2) NULL,
    `reason` TEXT NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_matches_entity_type_entity_id_rank_position_idx`(`entity_type`, `entity_id`, `rank_position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cross_sell_recommendations` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `product_code` VARCHAR(50) NOT NULL,
    `label` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `match_score` INTEGER NOT NULL,
    `rank_position` INTEGER NOT NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cross_sell_recommendations_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `action_recommendations` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EXECUTIVE', 'BRANCH', 'REGION', 'MANAGEMENT') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `action_type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 50,
    `due_at` DATETIME(3) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `action_recommendations_entity_type_entity_id_priority_idx`(`entity_type`, `entity_id`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `recommendation_history` ADD CONSTRAINT `recommendation_history_recommendation_id_fkey` FOREIGN KEY (`recommendation_id`) REFERENCES `recommendations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
