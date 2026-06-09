-- CreateTable: AI Platform Integration Layer

CREATE TABLE `ai_providers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provider_type` ENUM('OPENAI', 'LOCAL', 'FUTURE') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ai_providers_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_models` (
    `id` CHAR(36) NOT NULL,
    `provider_id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `capability` ENUM('CHAT', 'EMBEDDING', 'TRANSCRIPTION', 'TTS', 'MODERATION', 'REALTIME', 'STRUCTURED', 'FUNCTION_CALLING') NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `max_tokens` INTEGER NULL,
    `dimensions` INTEGER NULL,
    `cost_per_1k_in` DECIMAL(10, 6) NULL,
    `cost_per_1k_out` DECIMAL(10, 6) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ai_models_provider_id_code_key`(`provider_id`, `code`),
    INDEX `ai_models_capability_is_active_idx`(`capability`, `is_active`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_models_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_model_routes` (
    `id` CHAR(36) NOT NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `capability` ENUM('CHAT', 'EMBEDDING', 'TRANSCRIPTION', 'TTS', 'MODERATION', 'REALTIME', 'STRUCTURED', 'FUNCTION_CALLING') NOT NULL,
    `primary_model_id` CHAR(36) NOT NULL,
    `fallback_model_id` CHAR(36) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ai_model_routes_module_capability_key`(`module`, `capability`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_model_routes_primary_model_id_fkey` FOREIGN KEY (`primary_model_id`) REFERENCES `ai_models`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ai_model_routes_fallback_model_id_fkey` FOREIGN KEY (`fallback_model_id`) REFERENCES `ai_models`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_prompt_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(80) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ai_prompt_templates_code_key`(`code`),
    INDEX `ai_prompt_templates_module_is_active_idx`(`module`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_prompt_versions` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `content` LONGTEXT NOT NULL,
    `variables` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ai_prompt_versions_template_id_version_key`(`template_id`, `version`),
    INDEX `ai_prompt_versions_template_id_is_active_idx`(`template_id`, `is_active`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_prompt_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `ai_prompt_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_requests` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `request_type` ENUM('CHAT', 'COMPLETION', 'EMBEDDING', 'TRANSCRIPTION', 'TTS', 'MODERATION', 'FUNCTION_CALL') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'FALLBACK') NOT NULL DEFAULT 'PENDING',
    `model_code` VARCHAR(80) NULL,
    `provider_code` VARCHAR(50) NULL,
    `input_tokens` INTEGER NULL,
    `output_tokens` INTEGER NULL,
    `latency_ms` INTEGER NULL,
    `error_code` VARCHAR(50) NULL,
    `error_message` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `request_id` VARCHAR(64) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ai_requests_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_requests_module_request_type_idx`(`module`, `request_type`),
    INDEX `ai_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_responses` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NOT NULL,
    `content` LONGTEXT NULL,
    `structured` JSON NULL,
    `audio_url` VARCHAR(500) NULL,
    `embedding` JSON NULL,
    `tool_calls` JSON NULL,
    `moderated` BOOLEAN NOT NULL DEFAULT false,
    `pii_masked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `ai_responses_request_id_key`(`request_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_responses_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `ai_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_usage_logs` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `request_type` ENUM('CHAT', 'COMPLETION', 'EMBEDDING', 'TRANSCRIPTION', 'TTS', 'MODERATION', 'FUNCTION_CALL') NOT NULL,
    `model_code` VARCHAR(80) NOT NULL,
    `input_tokens` INTEGER NOT NULL DEFAULT 0,
    `output_tokens` INTEGER NOT NULL DEFAULT 0,
    `total_tokens` INTEGER NOT NULL DEFAULT 0,
    `latency_ms` INTEGER NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ai_usage_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_usage_logs_module_created_at_idx`(`module`, `created_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_usage_logs_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `ai_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_cost_logs` (
    `id` CHAR(36) NOT NULL,
    `request_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `model_code` VARCHAR(80) NOT NULL,
    `input_cost` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `output_cost` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `total_cost` DECIMAL(12, 6) NOT NULL DEFAULT 0,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ai_cost_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_cost_logs_module_created_at_idx`(`module`, `created_at`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ai_cost_logs_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `ai_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_moderation_logs` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `module` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'RAG', 'KNOWLEDGE', 'ADMIN', 'API') NOT NULL,
    `input_text` TEXT NOT NULL,
    `flagged` BOOLEAN NOT NULL DEFAULT false,
    `categories` JSON NULL,
    `scores` JSON NULL,
    `action` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `ai_moderation_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `ai_moderation_logs_flagged_idx`(`flagged`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
