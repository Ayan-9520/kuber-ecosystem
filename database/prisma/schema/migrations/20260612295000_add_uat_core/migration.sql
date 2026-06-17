-- UAT Core Framework

CREATE TABLE `uat_plans` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `version` VARCHAR(20) NOT NULL DEFAULT '1.0',
    `status` ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `owner_id` CHAR(36) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_plans_code_key`(`code`),
    INDEX `uat_plans_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_cycles` (
    `id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_cycles_code_key`(`code`),
    INDEX `uat_cycles_plan_id_status_idx`(`plan_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_scenarios` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `business_flow` ENUM('AUTH', 'CUSTOMER', 'DSA', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL', 'COMMISSION', 'SUPPORT', 'CAMPAIGN', 'AI', 'ANALYTICS') NOT NULL,
    `user_group` ENUM('CUSTOMER', 'DSA_PARTNER', 'SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'COMPLIANCE_OFFICER', 'MANAGEMENT', 'ADMIN') NOT NULL,
    `acceptance_criteria` JSON NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_scenarios_code_key`(`code`),
    INDEX `uat_scenarios_cycle_id_business_flow_idx`(`cycle_id`, `business_flow`),
    INDEX `uat_scenarios_business_flow_user_group_idx`(`business_flow`, `user_group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_test_cases` (
    `id` CHAR(36) NOT NULL,
    `scenario_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `test_type` ENUM('POSITIVE', 'NEGATIVE', 'BOUNDARY', 'BUSINESS_RULE', 'EXCEPTION') NOT NULL,
    `preconditions` TEXT NULL,
    `steps` JSON NULL,
    `expected_result` TEXT NOT NULL,
    `business_rule` TEXT NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_test_cases_code_key`(`code`),
    INDEX `uat_test_cases_scenario_id_test_type_idx`(`scenario_id`, `test_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_executions` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `test_case_id` CHAR(36) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED') NOT NULL DEFAULT 'NOT_STARTED',
    `executed_by` CHAR(36) NULL,
    `executed_at` DATETIME(3) NULL,
    `actual_result` TEXT NULL,
    `notes` TEXT NULL,
    `evidence` JSON NULL,
    `duration` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `uat_executions_cycle_id_status_idx`(`cycle_id`, `status`),
    INDEX `uat_executions_test_case_id_status_idx`(`test_case_id`, `status`),
    UNIQUE INDEX `uat_executions_cycle_id_test_case_id_key`(`cycle_id`, `test_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_defects` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `test_case_id` CHAR(36) NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'ASSIGNED', 'FIXED', 'RETEST', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `business_flow` ENUM('AUTH', 'CUSTOMER', 'DSA', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL', 'COMMISSION', 'SUPPORT', 'CAMPAIGN', 'AI', 'ANALYTICS') NULL,
    `assigned_to` CHAR(36) NULL,
    `reported_by` CHAR(36) NOT NULL,
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_defects_code_key`(`code`),
    INDEX `uat_defects_status_severity_idx`(`status`, `severity`),
    INDEX `uat_defects_business_flow_status_idx`(`business_flow`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_signoffs` (
    `id` CHAR(36) NOT NULL,
    `cycle_id` CHAR(36) NOT NULL,
    `signoff_type` ENUM('SALES', 'CREDIT', 'OPERATIONS', 'COMPLIANCE', 'MANAGEMENT', 'FINAL_UAT') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `signed_by` CHAR(36) NULL,
    `signed_at` DATETIME(3) NULL,
    `comments` TEXT NULL,
    `checklist` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `uat_signoffs_cycle_id_status_idx`(`cycle_id`, `status`),
    UNIQUE INDEX `uat_signoffs_cycle_id_signoff_type_key`(`cycle_id`, `signoff_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `uat_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `business_flow` ENUM('AUTH', 'CUSTOMER', 'DSA', 'LMS', 'LOS', 'DOCUMENT', 'REFERRAL', 'COMMISSION', 'SUPPORT', 'CAMPAIGN', 'AI', 'ANALYTICS') NOT NULL,
    `user_group` ENUM('CUSTOMER', 'DSA_PARTNER', 'SALES_EXECUTIVE', 'RELATIONSHIP_MANAGER', 'CREDIT_EXECUTIVE', 'OPERATIONS_EXECUTIVE', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'COMPLIANCE_OFFICER', 'MANAGEMENT', 'ADMIN') NOT NULL,
    `scenario_template` JSON NOT NULL,
    `test_case_templates` JSON NOT NULL,
    `acceptance_criteria` JSON NULL,
    `signoff_checklist` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uat_templates_code_key`(`code`),
    INDEX `uat_templates_business_flow_is_active_idx`(`business_flow`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uat_plans` ADD CONSTRAINT `uat_plans_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_plans` ADD CONSTRAINT `uat_plans_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_cycles` ADD CONSTRAINT `uat_cycles_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `uat_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_cycles` ADD CONSTRAINT `uat_cycles_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_scenarios` ADD CONSTRAINT `uat_scenarios_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_test_cases` ADD CONSTRAINT `uat_test_cases_scenario_id_fkey` FOREIGN KEY (`scenario_id`) REFERENCES `uat_scenarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_executions` ADD CONSTRAINT `uat_executions_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_executions` ADD CONSTRAINT `uat_executions_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `uat_test_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_executions` ADD CONSTRAINT `uat_executions_executed_by_fkey` FOREIGN KEY (`executed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_defects` ADD CONSTRAINT `uat_defects_test_case_id_fkey` FOREIGN KEY (`test_case_id`) REFERENCES `uat_test_cases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_defects` ADD CONSTRAINT `uat_defects_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_defects` ADD CONSTRAINT `uat_defects_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `uat_defects` ADD CONSTRAINT `uat_defects_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `uat_signoffs` ADD CONSTRAINT `uat_signoffs_cycle_id_fkey` FOREIGN KEY (`cycle_id`) REFERENCES `uat_cycles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `uat_signoffs` ADD CONSTRAINT `uat_signoffs_signed_by_fkey` FOREIGN KEY (`signed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
