-- Add FK and index for lead_score_history.lead_score_id

ALTER TABLE `lead_score_history` ADD INDEX `lead_score_history_lead_score_id_idx`(`lead_score_id`);

ALTER TABLE `lead_score_history` ADD CONSTRAINT `lead_score_history_lead_score_id_fkey` FOREIGN KEY (`lead_score_id`) REFERENCES `lead_scores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
