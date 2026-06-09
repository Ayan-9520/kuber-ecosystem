-- CreateTable
CREATE TABLE `ai_copilot_sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `status` ENUM('ACTIVE', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
    `context_payload` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_copilot_sessions_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_copilot_sessions_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_copilot_sessions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_insights` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `category` ENUM('LEAD', 'APPLICATION', 'EXECUTIVE', 'BRANCH', 'PRODUCT', 'PARTNER', 'MANAGEMENT', 'RISK', 'CONVERSION') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` TEXT NOT NULL,
    `details` JSON NULL,
    `confidence` DECIMAL(5, 2) NULL,
    `model_version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `provider` VARCHAR(30) NOT NULL DEFAULT 'rules-engine',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_insights_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_insights_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_insights_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_recommendations` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `recommendation_type` ENUM('PRODUCT', 'LENDER', 'EXECUTIVE', 'ACTION', 'CROSS_SELL', 'FOLLOW_UP') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `payload` JSON NULL,
    `priority` INTEGER NOT NULL DEFAULT 50,
    `accepted` BOOLEAN NULL,
    `accepted_at` DATETIME(3) NULL,
    `model_version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_recommendations_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_recommendations_recommendation_type_idx`(`recommendation_type`),
    INDEX `ai_recommendations_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_predictions` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `prediction_type` ENUM('APPROVAL', 'DISBURSAL', 'CONVERSION', 'DELAY', 'SUCCESS') NOT NULL,
    `probability` DECIMAL(5, 2) NOT NULL,
    `grade` VARCHAR(10) NULL,
    `factors` JSON NULL,
    `actual_outcome` VARCHAR(50) NULL,
    `was_accurate` BOOLEAN NULL,
    `model_version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_predictions_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_predictions_prediction_type_idx`(`prediction_type`),
    INDEX `ai_predictions_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_risk_flags` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `code` VARCHAR(50) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `description` TEXT NULL,
    `metadata` JSON NULL,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_risk_flags_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_risk_flags_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_action_suggestions` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NOT NULL,
    `entity_id` CHAR(36) NULL,
    `action_type` ENUM('CALL_CUSTOMER', 'COLLECT_DOCUMENTS', 'UPDATE_BANK_LOGIN', 'ESCALATE_CASE', 'SEND_REMINDER', 'RECOMMEND_TOP_UP', 'RECOMMEND_BT', 'RECOMMEND_CROSS_SELL', 'ASSIGN_EXECUTIVE', 'SCHEDULE_FOLLOW_UP') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 50,
    `due_at` DATETIME(3) NULL,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `completed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_action_suggestions_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ai_action_suggestions_action_type_idx`(`action_type`),
    INDEX `ai_action_suggestions_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_copilot_feedback` (
    `id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` ENUM('LEAD', 'APPLICATION', 'CUSTOMER', 'EXECUTIVE', 'BRANCH', 'PARTNER', 'PRODUCT', 'PORTFOLIO') NULL,
    `entity_id` CHAR(36) NULL,
    `rating` ENUM('HELPFUL', 'PARTIAL', 'NOT_HELPFUL') NOT NULL,
    `comment` TEXT NULL,
    `insight_id` CHAR(36) NULL,
    `recommendation_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_copilot_feedback_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_copilot_feedback_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ai_insights` ADD CONSTRAINT `ai_insights_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendations` ADD CONSTRAINT `ai_recommendations_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_predictions` ADD CONSTRAINT `ai_predictions_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_risk_flags` ADD CONSTRAINT `ai_risk_flags_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_action_suggestions` ADD CONSTRAINT `ai_action_suggestions_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_copilot_feedback` ADD CONSTRAINT `ai_copilot_feedback_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `ai_copilot_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
