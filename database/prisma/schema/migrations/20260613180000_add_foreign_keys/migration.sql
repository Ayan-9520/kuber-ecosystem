-- Campaign foreign keys, commission_ledger FK indexes, automation dead-letter relation

-- Align commission campaign_id columns with campaigns.id (CHAR(36))
ALTER TABLE `commission_rules` MODIFY `campaign_id` CHAR(36) NULL;
ALTER TABLE `commission_ledger` MODIFY `campaign_id` CHAR(36) NULL;

-- Indexes on commission_ledger foreign-key columns
CREATE INDEX `commission_ledger_rule_id_idx` ON `commission_ledger`(`rule_id`);
CREATE INDEX `commission_ledger_lead_id_idx` ON `commission_ledger`(`lead_id`);
CREATE INDEX `commission_ledger_application_id_idx` ON `commission_ledger`(`application_id`);
CREATE INDEX `commission_ledger_referral_id_idx` ON `commission_ledger`(`referral_id`);
CREATE INDEX `commission_ledger_product_id_idx` ON `commission_ledger`(`product_id`);
CREATE INDEX `commission_ledger_lender_id_idx` ON `commission_ledger`(`lender_id`);
CREATE INDEX `commission_ledger_campaign_id_idx` ON `commission_ledger`(`campaign_id`);

-- Campaign foreign keys
CREATE INDEX `automation_workflows_campaign_id_idx` ON `automation_workflows`(`campaign_id`);
ALTER TABLE `automation_workflows` ADD CONSTRAINT `automation_workflows_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `content_generation_requests_campaign_id_idx` ON `content_generation_requests`(`campaign_id`);
ALTER TABLE `content_generation_requests` ADD CONSTRAINT `content_generation_requests_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `commission_rules_campaign_id_idx` ON `commission_rules`(`campaign_id`);
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX `email_analytics_campaign_id_idx` ON `email_analytics`(`campaign_id`);
ALTER TABLE `email_analytics` ADD CONSTRAINT `email_analytics_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AutomationDeadLetter execution relation
ALTER TABLE `automation_dead_letters` ADD CONSTRAINT `automation_dead_letters_execution_id_fkey` FOREIGN KEY (`execution_id`) REFERENCES `automation_executions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
