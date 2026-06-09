-- KuberOne RAG Pipeline

CREATE TABLE `rag_knowledge_documents` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `source_type` ENUM('KNOWLEDGE_ARTICLE', 'PDF', 'DOCX', 'TXT', 'MD', 'HTML', 'POLICY', 'FAQ', 'SOP', 'PRODUCT_GUIDELINE', 'ELIGIBILITY_RULE', 'LENDER_POLICY') NOT NULL,
    `source_id` CHAR(36) NULL,
    `file_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(100) NULL,
    `raw_content` LONGTEXT NULL,
    `content_hash` VARCHAR(64) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('PENDING', 'PROCESSING', 'INDEXED', 'FAILED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    `category_code` VARCHAR(50) NULL,
    `product_code` VARCHAR(50) NULL,
    `lender_code` VARCHAR(50) NULL,
    `chunk_count` INTEGER NOT NULL DEFAULT 0,
    `embedding_count` INTEGER NOT NULL DEFAULT 0,
    `indexed_at` DATETIME(3) NULL,
    `ingestion_status` ENUM('QUEUED', 'CHUNKING', 'EMBEDDING', 'INDEXING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `error_message` TEXT NULL,
    `metadata` JSON NULL,
    `created_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `rag_knowledge_documents_source_type_source_id_idx`(`source_type`, `source_id`),
    INDEX `rag_knowledge_documents_status_ingestion_status_idx`(`status`, `ingestion_status`),
    INDEX `rag_knowledge_documents_category_code_idx`(`category_code`),
    INDEX `rag_knowledge_documents_product_code_idx`(`product_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_knowledge_chunks` (
    `id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `chunk_index` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `token_count` INTEGER NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `start_offset` INTEGER NULL,
    `end_offset` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rag_knowledge_chunks_document_id_chunk_index_version_key`(`document_id`, `chunk_index`, `version`),
    INDEX `rag_knowledge_chunks_document_id_idx`(`document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_vector_indexes` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `provider` ENUM('LOCAL', 'PGVECTOR', 'QDRANT', 'PINECONE', 'WEAVIATE') NOT NULL,
    `collection_id` VARCHAR(200) NULL,
    `dimensions` INTEGER NOT NULL,
    `document_count` INTEGER NOT NULL DEFAULT 0,
    `chunk_count` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `last_synced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rag_vector_indexes_name_provider_key`(`name`, `provider`),
    INDEX `rag_vector_indexes_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_embedding_records` (
    `id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `chunk_id` CHAR(36) NOT NULL,
    `vector_index_id` CHAR(36) NULL,
    `provider` ENUM('OPENAI', 'LOCAL_HASH', 'FUTURE') NOT NULL,
    `model` VARCHAR(50) NOT NULL,
    `dimensions` INTEGER NOT NULL,
    `embedding` JSON NOT NULL,
    `external_id` VARCHAR(200) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rag_embedding_records_document_id_idx`(`document_id`),
    INDEX `rag_embedding_records_chunk_id_idx`(`chunk_id`),
    INDEX `rag_embedding_records_vector_index_id_idx`(`vector_index_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_queries` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `query_text` TEXT NOT NULL,
    `source` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'ADMIN', 'API') NOT NULL,
    `filters` JSON NULL,
    `top_k` INTEGER NOT NULL DEFAULT 5,
    `chunk_count` INTEGER NOT NULL DEFAULT 0,
    `latency_ms` INTEGER NULL,
    `ip_address` VARCHAR(45) NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rag_queries_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `rag_queries_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_retrieval_logs` (
    `id` CHAR(36) NOT NULL,
    `query_id` CHAR(36) NULL,
    `user_id` CHAR(36) NULL,
    `query_text` TEXT NOT NULL,
    `source` ENUM('AI_ADVISOR', 'VOICE_AI', 'COPILOT', 'RECOMMENDATION', 'ADMIN', 'API') NOT NULL,
    `top_k` INTEGER NOT NULL,
    `chunk_ids` JSON NOT NULL,
    `scores` JSON NOT NULL,
    `latency_ms` INTEGER NULL,
    `vector_provider` ENUM('LOCAL', 'PGVECTOR', 'QDRANT', 'PINECONE', 'WEAVIATE') NOT NULL,
    `reranked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rag_retrieval_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `rag_retrieval_logs_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_responses` (
    `id` CHAR(36) NOT NULL,
    `query_id` CHAR(36) NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `context_used` JSON NOT NULL,
    `model` VARCHAR(50) NULL,
    `provider` VARCHAR(30) NULL,
    `tokens_used` INTEGER NULL,
    `latency_ms` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rag_responses_query_id_idx`(`query_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_feedback` (
    `id` CHAR(36) NOT NULL,
    `response_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `rating` INTEGER NOT NULL,
    `helpful` BOOLEAN NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rag_feedback_response_id_idx`(`response_id`),
    INDEX `rag_feedback_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `rag_analytics` (
    `id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `total_queries` INTEGER NOT NULL DEFAULT 0,
    `total_retrievals` INTEGER NOT NULL DEFAULT 0,
    `avg_latency_ms` INTEGER NOT NULL DEFAULT 0,
    `avg_feedback_rating` DECIMAL(3, 2) NULL,
    `top_document_id` CHAR(36) NULL,
    `top_category_code` VARCHAR(50) NULL,
    `retrieval_accuracy` DECIMAL(5, 2) NULL,
    `search_effectiveness` DECIMAL(5, 2) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rag_analytics_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `rag_knowledge_chunks` ADD CONSTRAINT `rag_knowledge_chunks_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `rag_knowledge_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rag_embedding_records` ADD CONSTRAINT `rag_embedding_records_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `rag_knowledge_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rag_embedding_records` ADD CONSTRAINT `rag_embedding_records_chunk_id_fkey` FOREIGN KEY (`chunk_id`) REFERENCES `rag_knowledge_chunks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rag_embedding_records` ADD CONSTRAINT `rag_embedding_records_vector_index_id_fkey` FOREIGN KEY (`vector_index_id`) REFERENCES `rag_vector_indexes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `rag_retrieval_logs` ADD CONSTRAINT `rag_retrieval_logs_query_id_fkey` FOREIGN KEY (`query_id`) REFERENCES `rag_queries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `rag_responses` ADD CONSTRAINT `rag_responses_query_id_fkey` FOREIGN KEY (`query_id`) REFERENCES `rag_queries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `rag_feedback` ADD CONSTRAINT `rag_feedback_response_id_fkey` FOREIGN KEY (`response_id`) REFERENCES `rag_responses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
