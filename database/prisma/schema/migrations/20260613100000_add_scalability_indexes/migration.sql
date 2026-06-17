-- Scalability indexes: list pagination, auth token lookup
CREATE INDEX `leads_deleted_at_created_at_idx` ON `leads`(`deleted_at`, `created_at` DESC);
CREATE INDEX `customers_deleted_at_created_at_idx` ON `customers`(`deleted_at`, `created_at` DESC);
CREATE INDEX `refresh_tokens_token_hash_idx` ON `refresh_tokens`(`token_hash`);
