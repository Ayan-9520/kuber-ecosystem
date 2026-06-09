-- AlterTable: extend lead_scores
ALTER TABLE `lead_scores` ADD COLUMN `classification` VARCHAR(50) NULL,
    ADD COLUMN `disbursal_probability` DECIMAL(5, 2) NULL,
    ADD COLUMN `conversion_probability` DECIMAL(5, 2) NULL,
    ADD COLUMN `risk_rating` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NULL,
    ADD COLUMN `priority_level` ENUM('HOT', 'WARM', 'NORMAL', 'LOW') NULL,
    ADD COLUMN `weight_version` VARCHAR(20) NULL;

CREATE INDEX `lead_scores_grade_idx` ON `lead_scores`(`grade`);
CREATE INDEX `lead_scores_risk_rating_idx` ON `lead_scores`(`risk_rating`);
CREATE INDEX `lead_scores_priority_level_idx` ON `lead_scores`(`priority_level`);

-- CreateTable
CREATE TABLE `lead_score_history` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `lead_score_id` CHAR(36) NULL,
    `previous_score` INTEGER NULL,
    `previous_grade` ENUM('A_PLUS', 'A', 'B', 'C', 'REJECTED') NULL,
    `new_score` INTEGER NOT NULL,
    `new_grade` ENUM('A_PLUS', 'A', 'B', 'C', 'REJECTED') NOT NULL,
    `change_reason` VARCHAR(200) NULL,
    `snapshot` JSON NOT NULL,
    `calculated_by_id` CHAR(36) NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_score_history_lead_id_created_at_idx`(`lead_id`, `created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_scoring_rules` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `factor` VARCHAR(50) NOT NULL,
    `rule_type` ENUM('STATIC', 'DYNAMIC', 'CONFIG') NOT NULL,
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

    UNIQUE INDEX `lead_scoring_rules_code_key`(`code`),
    INDEX `lead_scoring_rules_factor_is_active_idx`(`factor`, `is_active`),
    INDEX `lead_scoring_rules_rule_type_is_active_idx`(`rule_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_weight_configs` (
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

    UNIQUE INDEX `lead_weight_configs_version_factor_key`(`version`, `factor`),
    INDEX `lead_weight_configs_is_active_effective_from_idx`(`is_active`, `effective_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_risk_profiles` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `risk_rating` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `risk_score` INTEGER NOT NULL,
    `risk_factors` JSON NOT NULL,
    `fraud_risk` INTEGER NOT NULL DEFAULT 0,
    `document_risk` INTEGER NOT NULL DEFAULT 0,
    `drop_off_risk` INTEGER NOT NULL DEFAULT 0,
    `model_version` VARCHAR(20) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_risk_profiles_lead_id_calculated_at_idx`(`lead_id`, `calculated_at` DESC),
    INDEX `lead_risk_profiles_risk_rating_idx`(`risk_rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_predictions` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `prediction_type` ENUM('APPROVAL', 'DISBURSAL', 'CONVERSION', 'DROPOFF', 'DOCUMENT', 'FRAUD') NOT NULL,
    `probability` DECIMAL(5, 2) NOT NULL,
    `factors` JSON NULL,
    `actual_outcome` VARCHAR(50) NULL,
    `was_accurate` BOOLEAN NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_predictions_lead_id_prediction_type_idx`(`lead_id`, `prediction_type`),
    INDEX `lead_predictions_prediction_type_calculated_at_idx`(`prediction_type`, `calculated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_scoring_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `action` ENUM('SCORE_CALCULATED', 'BULK_SCORE_CALCULATED', 'RULE_CREATED', 'RULE_UPDATED', 'WEIGHT_CREATED', 'WEIGHT_UPDATED', 'THRESHOLD_UPDATED') NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_scoring_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `lead_scoring_audits_lead_id_created_at_idx`(`lead_id`, `created_at`),
    INDEX `lead_scoring_audits_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lead_score_history` ADD CONSTRAINT `lead_score_history_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_risk_profiles` ADD CONSTRAINT `lead_risk_profiles_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_predictions` ADD CONSTRAINT `lead_predictions_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_scoring_audits` ADD CONSTRAINT `lead_scoring_audits_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
