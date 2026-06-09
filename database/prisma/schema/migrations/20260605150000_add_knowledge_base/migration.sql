-- KuberOne AI Knowledge Base Management

CREATE TABLE `knowledge_categories` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `parent_id` CHAR(36) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `knowledge_categories_code_key`(`code`),
    INDEX `knowledge_categories_parent_id_is_active_idx`(`parent_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_articles` (
    `id` CHAR(36) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `content_type` ENUM('ARTICLE', 'POLICY', 'FAQ', 'SOP', 'TRAINING_MATERIAL', 'SCRIPT', 'VIDEO_METADATA', 'DOCUMENT_METADATA') NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `status` ENUM('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `current_version` INTEGER NOT NULL DEFAULT 1,
    `author_id` CHAR(36) NULL,
    `reviewer_id` CHAR(36) NULL,
    `approver_id` CHAR(36) NULL,
    `publisher_id` CHAR(36) NULL,
    `published_at` DATETIME(3) NULL,
    `archived_at` DATETIME(3) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `search_keywords` TEXT NULL,
    `semantic_ready` BOOLEAN NOT NULL DEFAULT true,
    `department` VARCHAR(100) NULL,
    `product_code` VARCHAR(50) NULL,
    `lender_code` VARCHAR(50) NULL,
    `risk_category` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `knowledge_articles_slug_key`(`slug`),
    INDEX `knowledge_articles_category_id_status_idx`(`category_id`, `status`),
    INDEX `knowledge_articles_content_type_status_idx`(`content_type`, `status`),
    INDEX `knowledge_articles_status_published_at_idx`(`status`, `published_at`),
    INDEX `knowledge_articles_product_code_idx`(`product_code`),
    INDEX `knowledge_articles_lender_code_idx`(`lender_code`),
    FULLTEXT INDEX `knowledge_articles_title_summary_content_search_keywords_idx`(`title`, `summary`, `content`, `search_keywords`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_versions` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `change_notes` TEXT NULL,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `knowledge_versions_article_id_version_key`(`article_id`, `version`),
    INDEX `knowledge_versions_article_id_created_at_idx`(`article_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_tags` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `tag_group` VARCHAR(50) NOT NULL,
    `color` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `knowledge_tags_code_key`(`code`),
    INDEX `knowledge_tags_tag_group_is_active_idx`(`tag_group`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_article_tags` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `knowledge_article_tags_article_id_tag_id_key`(`article_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_attachments` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size` INTEGER NULL,
    `storage_url` TEXT NULL,
    `metadata` JSON NULL,
    `uploaded_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_attachments_article_id_idx`(`article_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_approvals` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `action` ENUM('SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED', 'ROLLED_BACK') NOT NULL,
    `actor_id` CHAR(36) NOT NULL,
    `actor_role` VARCHAR(50) NOT NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_approvals_article_id_created_at_idx`(`article_id`, `created_at`),
    INDEX `knowledge_approvals_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_reviews` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `reviewer_id` CHAR(36) NOT NULL,
    `rating` INTEGER NULL,
    `comments` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_reviews_article_id_status_idx`(`article_id`, `status`),
    INDEX `knowledge_reviews_reviewer_id_idx`(`reviewer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_feedback` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `helpful` BOOLEAN NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_feedback_article_id_created_at_idx`(`article_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_views` (
    `id` CHAR(36) NOT NULL,
    `article_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `source` VARCHAR(50) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_views_article_id_created_at_idx`(`article_id`, `created_at`),
    INDEX `knowledge_views_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_audits` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `action` ENUM('CREATED', 'UPDATED', 'DELETED', 'PUBLISHED', 'ARCHIVED', 'VERSION_CREATED', 'APPROVAL_SUBMITTED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED', 'FEEDBACK_ADDED', 'VIEWED', 'SEARCHED') NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_audits_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `knowledge_audits_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `knowledge_audits_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_search_history` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `query` VARCHAR(500) NOT NULL,
    `search_type` VARCHAR(30) NOT NULL,
    `filters` JSON NULL,
    `result_count` INTEGER NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_search_history_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `knowledge_search_history_query_idx`(`query`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `knowledge_categories` ADD CONSTRAINT `knowledge_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `knowledge_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `knowledge_articles` ADD CONSTRAINT `knowledge_articles_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `knowledge_versions` ADD CONSTRAINT `knowledge_versions_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_article_tags` ADD CONSTRAINT `knowledge_article_tags_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_article_tags` ADD CONSTRAINT `knowledge_article_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `knowledge_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_attachments` ADD CONSTRAINT `knowledge_attachments_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_approvals` ADD CONSTRAINT `knowledge_approvals_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_reviews` ADD CONSTRAINT `knowledge_reviews_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_feedback` ADD CONSTRAINT `knowledge_feedback_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `knowledge_views` ADD CONSTRAINT `knowledge_views_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `knowledge_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
