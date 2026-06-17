-- Audit & Compliance Center

CREATE TABLE `audit_events` (
    `id` CHAR(36) NOT NULL,
    `trace_id` VARCHAR(64) NOT NULL,
    `source` ENUM('AUTH', 'RBAC', 'CUSTOMERS', 'PARTNERS', 'LEADS', 'APPLICATIONS', 'DOCUMENTS', 'REFERRALS', 'COMMISSIONS', 'NOTIFICATIONS', 'SUPPORT', 'AI', 'ANALYTICS', 'CAMPAIGNS', 'AUTOMATION', 'CONTENT', 'KNOWLEDGE', 'RAG', 'SETTINGS', 'SYSTEM') NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'ASSIGN', 'ESCALATE', 'EXPORT', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PERMISSION_CHANGE', 'ROLE_CHANGE', 'CONFIG_CHANGE', 'AI_ACTION', 'VOICE_ACTION', 'VIEW', 'DOWNLOAD', 'PUBLISH', 'ARCHIVE') NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `user_role` VARCHAR(64) NULL,
    `session_id` VARCHAR(64) NULL,
    `before_value` JSON NULL,
    `after_value` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `device_fingerprint` VARCHAR(128) NULL,
    `geo_location` VARCHAR(128) NULL,
    `request_id` VARCHAR(64) NULL,
    `integrity_hash` VARCHAR(64) NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_events_source_created_at_idx`(`source`, `created_at`),
    INDEX `audit_events_action_created_at_idx`(`action`, `created_at`),
    INDEX `audit_events_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_events_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_events_trace_id_idx`(`trace_id`),
    INDEX `audit_events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_reports` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `report_type` VARCHAR(64) NOT NULL,
    `filters` JSON NULL,
    `format` ENUM('CSV', 'EXCEL', 'PDF', 'JSON') NOT NULL DEFAULT 'CSV',
    `status` ENUM('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `file_url` VARCHAR(500) NULL,
    `row_count` INTEGER NOT NULL DEFAULT 0,
    `generated_by` CHAR(36) NULL,
    `generated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `audit_reports_code_key`(`code`),
    INDEX `audit_reports_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_exports` (
    `id` CHAR(36) NOT NULL,
    `export_type` VARCHAR(64) NOT NULL,
    `format` ENUM('CSV', 'EXCEL', 'PDF', 'JSON') NOT NULL DEFAULT 'CSV',
    `filters` JSON NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `row_count` INTEGER NOT NULL DEFAULT 0,
    `checksum` VARCHAR(64) NULL,
    `exported_by` CHAR(36) NOT NULL,
    `exported_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_exports_exported_by_exported_at_idx`(`exported_by`, `exported_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `compliance_rules` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `framework` ENUM('DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT') NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `rule_type` VARCHAR(64) NOT NULL,
    `condition` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compliance_rules_code_key`(`code`),
    INDEX `compliance_rules_framework_is_active_idx`(`framework`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `compliance_violations` (
    `id` CHAR(36) NOT NULL,
    `rule_id` CHAR(36) NOT NULL,
    `status` ENUM('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ESCALATED') NOT NULL DEFAULT 'OPEN',
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `description` TEXT NOT NULL,
    `evidence` JSON NULL,
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `compliance_violations_status_severity_idx`(`status`, `severity`),
    INDEX `compliance_violations_rule_id_created_at_idx`(`rule_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `compliance_reports` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `framework` ENUM('DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT') NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `compliance_score` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `violation_count` INTEGER NOT NULL DEFAULT 0,
    `summary` JSON NULL,
    `format` ENUM('CSV', 'EXCEL', 'PDF', 'JSON') NOT NULL DEFAULT 'PDF',
    `status` ENUM('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `generated_by` CHAR(36) NULL,
    `generated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `compliance_reports_code_key`(`code`),
    INDEX `compliance_reports_framework_period_start_idx`(`framework`, `period_start`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `risk_register` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `risk_type` ENUM('OPERATIONAL', 'CREDIT', 'COMPLIANCE', 'SECURITY', 'AI', 'FRAUD', 'PARTNER') NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('IDENTIFIED', 'ASSESSING', 'MITIGATING', 'ACCEPTED', 'CLOSED') NOT NULL DEFAULT 'IDENTIFIED',
    `likelihood` INTEGER NOT NULL DEFAULT 50,
    `impact` INTEGER NOT NULL DEFAULT 50,
    `risk_score` INTEGER NOT NULL DEFAULT 0,
    `owner_id` CHAR(36) NULL,
    `mitigation_plan` TEXT NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `risk_register_code_key`(`code`),
    INDEX `risk_register_risk_type_status_idx`(`risk_type`, `status`),
    INDEX `risk_register_severity_risk_score_idx`(`severity`, `risk_score`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `risk_assessments` (
    `id` CHAR(36) NOT NULL,
    `risk_id` CHAR(36) NOT NULL,
    `assessor_id` CHAR(36) NOT NULL,
    `likelihood` INTEGER NOT NULL,
    `impact` INTEGER NOT NULL,
    `risk_score` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `assessed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `risk_assessments_risk_id_assessed_at_idx`(`risk_id`, `assessed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `risk_events` (
    `id` CHAR(36) NOT NULL,
    `risk_id` CHAR(36) NULL,
    `risk_type` ENUM('OPERATIONAL', 'CREDIT', 'COMPLIANCE', 'SECURITY', 'AI', 'FRAUD', 'PARTNER') NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `entity_type` VARCHAR(64) NULL,
    `entity_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `risk_events_risk_type_created_at_idx`(`risk_type`, `created_at`),
    INDEX `risk_events_severity_created_at_idx`(`severity`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `security_events` (
    `id` CHAR(36) NOT NULL,
    `event_type` ENUM('FAILED_LOGIN', 'ACCOUNT_LOCKOUT', 'SUSPICIOUS_ACTIVITY', 'PERMISSION_ESCALATION', 'API_ABUSE', 'RATE_LIMIT_VIOLATION', 'FILE_UPLOAD_RISK', 'AI_PROMPT_ABUSE', 'SESSION_HIJACK', 'BRUTE_FORCE') NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `user_id` CHAR(36) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `description` TEXT NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `security_events_event_type_created_at_idx`(`event_type`, `created_at`),
    INDEX `security_events_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `security_alerts` (
    `id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'HIGH',
    `status` ENUM('OPEN', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE') NOT NULL DEFAULT 'OPEN',
    `assigned_to` CHAR(36) NULL,
    `resolved_by` CHAR(36) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `security_alerts_status_severity_idx`(`status`, `severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `data_access_logs` (
    `id` CHAR(36) NOT NULL,
    `access_type` ENUM('PII_ACCESS', 'SENSITIVE_DATA', 'DATA_EXPORT', 'BULK_ACTION', 'FILE_DOWNLOAD', 'DOCUMENT_VIEW') NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `field_names` JSON NULL,
    `record_count` INTEGER NOT NULL DEFAULT 1,
    `ip_address` VARCHAR(45) NULL,
    `purpose` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `data_access_logs_access_type_created_at_idx`(`access_type`, `created_at`),
    INDEX `data_access_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `data_access_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `governance_policies` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `policy_type` ENUM('DATA_GOVERNANCE', 'ACCESS_GOVERNANCE', 'AI_GOVERNANCE', 'DOCUMENT_RETENTION', 'SECURITY', 'COMPLIANCE') NOT NULL,
    `description` TEXT NULL,
    `content` TEXT NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATETIME(3) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `governance_policies_code_key`(`code`),
    INDEX `governance_policies_policy_type_is_active_idx`(`policy_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `retention_policies` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `entity_type` VARCHAR(64) NOT NULL,
    `retention_days` INTEGER NOT NULL,
    `action` ENUM('ARCHIVE', 'DELETE', 'ANONYMIZE', 'REVIEW') NOT NULL DEFAULT 'ARCHIVE',
    `framework` ENUM('DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `retention_policies_code_key`(`code`),
    INDEX `retention_policies_entity_type_is_active_idx`(`entity_type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `compliance_audits` (
    `id` CHAR(36) NOT NULL,
    `framework` ENUM('DPDP', 'KYC', 'AML', 'INTERNAL_POLICY', 'SECURITY', 'OPERATIONAL', 'AUDIT') NOT NULL,
    `audit_type` VARCHAR(64) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `findings` JSON NULL,
    `score` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `auditor_id` CHAR(36) NULL,
    `audited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `compliance_audits_framework_audited_at_idx`(`framework`, `audited_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_events` ADD CONSTRAINT `audit_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_reports` ADD CONSTRAINT `audit_reports_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_exports` ADD CONSTRAINT `audit_exports_exported_by_fkey` FOREIGN KEY (`exported_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `compliance_rules` ADD CONSTRAINT `compliance_rules_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compliance_rules` ADD CONSTRAINT `compliance_rules_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compliance_violations` ADD CONSTRAINT `compliance_violations_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `compliance_rules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `compliance_violations` ADD CONSTRAINT `compliance_violations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compliance_violations` ADD CONSTRAINT `compliance_violations_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compliance_reports` ADD CONSTRAINT `compliance_reports_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `risk_register` ADD CONSTRAINT `risk_register_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `risk_register` ADD CONSTRAINT `risk_register_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `risk_assessments` ADD CONSTRAINT `risk_assessments_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `risk_register`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `risk_assessments` ADD CONSTRAINT `risk_assessments_assessor_id_fkey` FOREIGN KEY (`assessor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `risk_events` ADD CONSTRAINT `risk_events_risk_id_fkey` FOREIGN KEY (`risk_id`) REFERENCES `risk_register`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `security_events` ADD CONSTRAINT `security_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `security_alerts` ADD CONSTRAINT `security_alerts_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `security_events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `security_alerts` ADD CONSTRAINT `security_alerts_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `security_alerts` ADD CONSTRAINT `security_alerts_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `data_access_logs` ADD CONSTRAINT `data_access_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `governance_policies` ADD CONSTRAINT `governance_policies_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `compliance_audits` ADD CONSTRAINT `compliance_audits_auditor_id_fkey` FOREIGN KEY (`auditor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
