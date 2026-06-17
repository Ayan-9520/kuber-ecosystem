-- CreateTable: Go-Live Validation Framework

CREATE TABLE `go_live_checklists` (
    `id` CHAR(36) NOT NULL,
    `section` VARCHAR(64) NOT NULL,
    `item_code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    `weight` INTEGER NOT NULL DEFAULT 1,
    `evidence` JSON NULL,
    `verified_at` DATETIME(3) NULL,
    `verified_by_id` CHAR(36) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_blocking` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `go_live_checklists_item_code_key`(`item_code`),
    INDEX `go_live_checklists_section_status_idx`(`section`, `status`),
    INDEX `go_live_checklists_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `launch_executions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `status` ENUM('PLANNED', 'PRE_LAUNCH', 'IN_PROGRESS', 'COMPLETED', 'ROLLED_BACK', 'ABORTED') NOT NULL DEFAULT 'PLANNED',
    `target_date` DATETIME(3) NULL,
    `launched_at` DATETIME(3) NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `readiness_pct` INTEGER NOT NULL DEFAULT 0,
    `blockers` JSON NULL,
    `metadata` JSON NULL,
    `executed_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `launch_executions_code_key`(`code`),
    INDEX `launch_executions_status_target_date_idx`(`status`, `target_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `go_live_approvals` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `approval_type` ENUM('QA', 'SECURITY', 'DEVOPS', 'PRODUCT', 'MANAGEMENT', 'FINAL_RELEASE') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `checklist` JSON NULL,
    `comments` TEXT NULL,
    `approved_by_id` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `go_live_approvals_status_approval_type_idx`(`status`, `approval_type`),
    UNIQUE INDEX `go_live_approvals_launch_execution_id_approval_type_key`(`launch_execution_id`, `approval_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `release_gates` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NOT NULL,
    `gate_code` VARCHAR(64) NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `status` ENUM('PENDING', 'PASSED', 'FAILED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `detail` VARCHAR(500) NULL,
    `is_blocking` BOOLEAN NOT NULL DEFAULT true,
    `evaluated_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `release_gates_status_gate_code_idx`(`status`, `gate_code`),
    UNIQUE INDEX `release_gates_launch_execution_id_gate_code_key`(`launch_execution_id`, `gate_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `launch_audits` (
    `id` CHAR(36) NOT NULL,
    `launch_execution_id` CHAR(36) NULL,
    `action` ENUM('CHECKLIST_UPDATE', 'APPROVAL_SUBMIT', 'APPROVAL_DECIDE', 'LAUNCH_START', 'LAUNCH_COMPLETE', 'LAUNCH_ROLLBACK', 'GATE_EVALUATE', 'REPORT_GENERATE') NOT NULL,
    `actor_id` CHAR(36) NULL,
    `compliance` VARCHAR(64) NULL,
    `details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `launch_audits_action_created_at_idx`(`action`, `created_at`),
    INDEX `launch_audits_launch_execution_id_idx`(`launch_execution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `go_live_reports` (
    `id` CHAR(36) NOT NULL,
    `report_type` ENUM('READINESS', 'APPROVAL', 'RELEASE', 'RISK') NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `readiness_pct` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(500) NULL,
    `details` JSON NULL,
    `generated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `go_live_reports_report_type_generated_at_idx`(`report_type`, `generated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `go_live_checklists` ADD CONSTRAINT `go_live_checklists_verified_by_id_fkey` FOREIGN KEY (`verified_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `launch_executions` ADD CONSTRAINT `launch_executions_executed_by_id_fkey` FOREIGN KEY (`executed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `go_live_approvals` ADD CONSTRAINT `go_live_approvals_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `go_live_approvals` ADD CONSTRAINT `go_live_approvals_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `release_gates` ADD CONSTRAINT `release_gates_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `launch_audits` ADD CONSTRAINT `launch_audits_launch_execution_id_fkey` FOREIGN KEY (`launch_execution_id`) REFERENCES `launch_executions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `launch_audits` ADD CONSTRAINT `launch_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
