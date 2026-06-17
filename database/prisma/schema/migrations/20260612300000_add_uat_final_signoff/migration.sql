-- Final UAT Signoff Framework

CREATE TABLE `uat_stakeholders` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `stakeholder_group` ENUM('MANAGEMENT', 'SALES', 'RELATIONSHIP_MANAGER', 'CREDIT', 'OPERATIONS', 'COMPLIANCE', 'SUPPORT', 'DSA_PARTNER', 'CUSTOMER_JOURNEY', 'TECHNOLOGY') NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `department` VARCHAR(128) NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_stakeholders_cycle_id_stakeholder_group_key`(`cycle_id`, `stakeholder_group`),
    INDEX `uat_stakeholders_cycle_id_sort_order_idx`(`cycle_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_approvals` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `stakeholder_id` CHAR(36) NOT NULL,
    `stage` ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED') NOT NULL DEFAULT 'PENDING',
    `approver_name` VARCHAR(200) NULL,
    `approver_role` VARCHAR(128) NULL,
    `department` VARCHAR(128) NULL,
    `approved_by_id` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `comments` TEXT NULL,
    `checklist` JSON NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_approvals_cycle_id_stakeholder_id_key`(`cycle_id`, `stakeholder_id`),
    INDEX `uat_approvals_cycle_id_stage_idx`(`cycle_id`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_reviews` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `review_area` ENUM('CUSTOMER_JOURNEY', 'DSA_JOURNEY', 'CRM_JOURNEY', 'BUSINESS_WORKFLOWS', 'AI_WORKFLOWS', 'NOTIFICATIONS', 'SECURITY', 'OPERATIONS', 'PERFORMANCE') NOT NULL,
    `stage` ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED') NOT NULL DEFAULT 'PENDING',
    `score` INT NOT NULL DEFAULT 0,
    `checklist` JSON NULL,
    `findings` JSON NULL,
    `reviewed_by_id` CHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_reviews_cycle_id_review_area_key`(`cycle_id`, `review_area`),
    INDEX `uat_reviews_cycle_id_stage_idx`(`cycle_id`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_risks` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `review_area` ENUM('CUSTOMER_JOURNEY', 'DSA_JOURNEY', 'CRM_JOURNEY', 'BUSINESS_WORKFLOWS', 'AI_WORKFLOWS', 'NOTIFICATIONS', 'SECURITY', 'OPERATIONS', 'PERFORMANCE') NULL,
    `mitigation` TEXT NULL,
    `owner_id` CHAR(36) NULL,
    `created_by_id` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_risks_code_key`(`code`),
    INDEX `uat_risks_cycle_id_severity_status_idx`(`cycle_id`, `severity`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_comments` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `target_type` ENUM('APPROVAL', 'REVIEW', 'RISK', 'SIGNOFF') NOT NULL,
    `target_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `uat_comments_target_type_target_id_idx`(`target_type`, `target_id`),
    INDEX `uat_comments_cycle_id_created_at_idx`(`cycle_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `uat_stakeholders` ADD CONSTRAINT `uat_stakeholders_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_approvals` ADD CONSTRAINT `uat_approvals_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_approvals` ADD CONSTRAINT `uat_approvals_stakeholder_id_fkey` FOREIGN KEY (`stakeholder_id`) REFERENCES `uat_stakeholders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_approvals` ADD CONSTRAINT `uat_approvals_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_reviews` ADD CONSTRAINT `uat_reviews_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_reviews` ADD CONSTRAINT `uat_reviews_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_risks` ADD CONSTRAINT `uat_risks_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_risks` ADD CONSTRAINT `uat_risks_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_risks` ADD CONSTRAINT `uat_risks_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_comments` ADD CONSTRAINT `uat_comments_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_comments` ADD CONSTRAINT `uat_comments_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
