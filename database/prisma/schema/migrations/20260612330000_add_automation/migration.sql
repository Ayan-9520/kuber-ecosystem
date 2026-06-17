-- KuberOne Marketing Automation Engine

CREATE TABLE `automation_workflows` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `journey_type` ENUM('LEAD_NURTURING', 'LEAD_REENGAGEMENT', 'CUSTOMER_ONBOARDING', 'DOCUMENT_COLLECTION', 'APPLICATION_FOLLOWUP', 'SANCTION_FOLLOWUP', 'DISBURSEMENT_FOLLOWUP', 'REFERRAL_AUTOMATION', 'COMMISSION_AUTOMATION', 'CUSTOMER_RETENTION', 'CROSS_SELL', 'UPSELL', 'BIRTHDAY_CAMPAIGN', 'ANNIVERSARY_CAMPAIGN', 'RENEWAL_CAMPAIGN', 'FEEDBACK_CAMPAIGN') NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` INTEGER NOT NULL DEFAULT 1,
    `canvas_json` JSON NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `data_scope_json` JSON NULL,
    `requires_approval` BOOLEAN NOT NULL DEFAULT true,
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `activated_at` DATETIME(3) NULL,
    `paused_at` DATETIME(3) NULL,
    `campaign_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_by` CHAR(36) NOT NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `automation_workflows_status_journey_type_idx`(`status`, `journey_type`),
    INDEX `automation_workflows_branch_id_region_id_idx`(`branch_id`, `region_id`),
    INDEX `automation_workflows_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_nodes` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `node_key` VARCHAR(64) NOT NULL,
    `type` ENUM('TRIGGER', 'CONDITION', 'ACTION', 'DELAY', 'BRANCH', 'LOOP', 'GOAL', 'EXIT') NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `position_x` DOUBLE NOT NULL DEFAULT 0,
    `position_y` DOUBLE NOT NULL DEFAULT 0,
    `config` JSON NULL,
    `next_node_keys` JSON NULL,
    `parent_key` VARCHAR(64) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_nodes_workflow_id_type_idx`(`workflow_id`, `type`),
    UNIQUE INDEX `automation_nodes_workflow_id_node_key_key`(`workflow_id`, `node_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_triggers` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `trigger_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_SCORE_CHANGED', 'APPLICATION_CREATED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'APPLICATION_SANCTIONED', 'APPLICATION_DISBURSED', 'DOCUMENT_UPLOADED', 'DOCUMENT_REJECTED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'COMMISSION_APPROVED', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'CUSTOMER_REGISTERED', 'CUSTOMER_LOGIN', 'CUSTOMER_INACTIVE') NOT NULL,
    `config` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_triggers_trigger_type_is_active_idx`(`trigger_type`, `is_active`),
    INDEX `automation_triggers_workflow_id_idx`(`workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_conditions` (
    `id` CHAR(36) NOT NULL,
    `node_id` CHAR(36) NOT NULL,
    `field` VARCHAR(64) NOT NULL,
    `operator` VARCHAR(32) NOT NULL,
    `value` JSON NULL,
    `logic_group` VARCHAR(32) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_conditions_node_id_idx`(`node_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_actions` (
    `id` CHAR(36) NOT NULL,
    `node_id` CHAR(36) NOT NULL,
    `action_type` ENUM('SEND_EMAIL', 'SEND_SMS', 'SEND_WHATSAPP', 'SEND_PUSH', 'CREATE_CRM_TASK', 'ASSIGN_LEAD', 'REASSIGN_LEAD', 'UPDATE_LEAD_SCORE', 'UPDATE_STATUS', 'CREATE_FOLLOW_UP', 'CREATE_TICKET', 'ESCALATE_TICKET', 'TRIGGER_AI_RECOMMENDATION', 'GENERATE_AI_CONTENT') NOT NULL,
    `channel` VARCHAR(32) NULL,
    `template_code` VARCHAR(64) NULL,
    `config` JSON NULL,
    `delay_before` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_actions_node_id_idx`(`node_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_executions` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXITED', 'GOAL_ACHIEVED') NOT NULL DEFAULT 'PENDING',
    `trigger_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_SCORE_CHANGED', 'APPLICATION_CREATED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'APPLICATION_SANCTIONED', 'APPLICATION_DISBURSED', 'DOCUMENT_UPLOADED', 'DOCUMENT_REJECTED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'COMMISSION_APPROVED', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'CUSTOMER_REGISTERED', 'CUSTOMER_LOGIN', 'CUSTOMER_INACTIVE') NOT NULL,
    `subject_type` VARCHAR(64) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `current_node_key` VARCHAR(64) NULL,
    `context` JSON NULL,
    `scheduled_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `goal_achieved` BOOLEAN NOT NULL DEFAULT false,
    `exit_reason` VARCHAR(255) NULL,
    `error_message` TEXT NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `revenue_amount` DECIMAL(18, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_executions_workflow_id_status_idx`(`workflow_id`, `status`),
    INDEX `automation_executions_subject_type_subject_id_idx`(`subject_type`, `subject_id`),
    INDEX `automation_executions_status_scheduled_at_idx`(`status`, `scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_logs` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `node_key` VARCHAR(64) NULL,
    `level` ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'INFO',
    `message` TEXT NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_logs_execution_id_created_at_idx`(`execution_id`, `created_at`),
    INDEX `automation_logs_workflow_id_created_at_idx`(`workflow_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_goals` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `goal_type` ENUM('APPLICATION_SUBMITTED', 'APPLICATION_APPROVED', 'APPLICATION_DISBURSED', 'REFERRAL_CONVERTED', 'COMMISSION_PAID', 'SUPPORT_RESOLVED') NOT NULL,
    `config` JSON NULL,
    `target_count` INTEGER NULL,
    `achieved_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_goals_workflow_id_idx`(`workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_templates` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `journey_type` ENUM('LEAD_NURTURING', 'LEAD_REENGAGEMENT', 'CUSTOMER_ONBOARDING', 'DOCUMENT_COLLECTION', 'APPLICATION_FOLLOWUP', 'SANCTION_FOLLOWUP', 'DISBURSEMENT_FOLLOWUP', 'REFERRAL_AUTOMATION', 'COMMISSION_AUTOMATION', 'CUSTOMER_RETENTION', 'CROSS_SELL', 'UPSELL', 'BIRTHDAY_CAMPAIGN', 'ANNIVERSARY_CAMPAIGN', 'RENEWAL_CAMPAIGN', 'FEEDBACK_CAMPAIGN') NOT NULL,
    `category` VARCHAR(64) NULL,
    `canvas_json` JSON NULL,
    `nodes_json` JSON NULL,
    `triggers_json` JSON NULL,
    `goals_json` JSON NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_templates_journey_type_is_public_idx`(`journey_type`, `is_public`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_analytics` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `total_runs` INTEGER NOT NULL DEFAULT 0,
    `success_count` INTEGER NOT NULL DEFAULT 0,
    `failure_count` INTEGER NOT NULL DEFAULT 0,
    `conversion_rate` DECIMAL(8, 4) NOT NULL DEFAULT 0,
    `drop_off_rate` DECIMAL(8, 4) NOT NULL DEFAULT 0,
    `revenue_generated` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `roi` DECIMAL(10, 4) NOT NULL DEFAULT 0,
    `channel_breakdown` JSON NULL,
    `journey_metrics` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_analytics_workflow_id_period_start_idx`(`workflow_id`, `period_start`),
    UNIQUE INDEX `automation_analytics_workflow_id_period_start_period_end_key`(`workflow_id`, `period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_audits` (
    `id` CHAR(36) NOT NULL,
    `workflow_id` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `actor_id` CHAR(36) NOT NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(512) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_audits_workflow_id_created_at_idx`(`workflow_id`, `created_at`),
    INDEX `automation_audits_actor_id_idx`(`actor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_queue` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NOT NULL,
    `node_key` VARCHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER') NOT NULL DEFAULT 'PENDING',
    `scheduled_at` DATETIME(3) NOT NULL,
    `payload` JSON NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` TEXT NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_queue_status_scheduled_at_idx`(`status`, `scheduled_at`),
    INDEX `automation_queue_execution_id_idx`(`execution_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `automation_dead_letters` (
    `id` CHAR(36) NOT NULL,
    `execution_id` CHAR(36) NOT NULL,
    `node_key` VARCHAR(64) NOT NULL,
    `payload` JSON NULL,
    `error` TEXT NOT NULL,
    `retry_count` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `automation_dead_letters_execution_id_idx`(`execution_id`),
    INDEX `automation_dead_letters_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_nodes` ADD CONSTRAINT `automation_nodes_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_triggers` ADD CONSTRAINT `automation_triggers_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_conditions` ADD CONSTRAINT `automation_conditions_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `automation_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_actions` ADD CONSTRAINT `automation_actions_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `automation_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_executions` ADD CONSTRAINT `automation_executions_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `automation_executions` ADD CONSTRAINT `automation_executions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_logs` ADD CONSTRAINT `automation_logs_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `automation_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_goals` ADD CONSTRAINT `automation_goals_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_templates` ADD CONSTRAINT `automation_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_analytics` ADD CONSTRAINT `automation_analytics_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `automation_audits` ADD CONSTRAINT `automation_audits_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `automation_workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `automation_audits` ADD CONSTRAINT `automation_audits_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `automation_queue` ADD CONSTRAINT `automation_queue_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `automation_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
