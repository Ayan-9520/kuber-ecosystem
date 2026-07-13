-- Kuber Verified Professional™ — Partner Personal Branding Platform

-- CreateTable
CREATE TABLE `partner_brand_profiles` (
    `id` CHAR(36) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `cover_image_url` VARCHAR(500) NULL,
    `photo_url` VARCHAR(500) NULL,
    `company_logo_url` VARCHAR(500) NULL,
    `display_name` VARCHAR(150) NOT NULL,
    `designation` VARCHAR(150) NULL,
    `tagline` VARCHAR(300) NULL,
    `company_name` VARCHAR(200) NULL,
    `company_category` VARCHAR(100) NULL,
    `biography` TEXT NULL,
    `mission` TEXT NULL,
    `vision` TEXT NULL,
    `experience_years` INTEGER NULL,
    `business_since` INTEGER NULL,
    `languages` JSON NULL,
    `working_areas` JSON NULL,
    `gender` VARCHAR(20) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `country` VARCHAR(60) NOT NULL DEFAULT 'India',
    `gst_number` VARCHAR(20) NULL,
    `established_year` INTEGER NULL,
    `founder_name` VARCHAR(150) NULL,
    `office_address` TEXT NULL,
    `cities_served` JSON NULL,
    `company_website` VARCHAR(500) NULL,
    `phone` VARCHAR(15) NULL,
    `whatsapp` VARCHAR(15) NULL,
    `email` VARCHAR(255) NULL,
    `consultation_url` VARCHAR(500) NULL,
    `calendar_url` VARCHAR(500) NULL,
    `apply_loan_url` VARCHAR(500) NULL,
    `apply_insurance_url` VARCHAR(500) NULL,
    `seo_title` VARCHAR(200) NULL,
    `seo_description` TEXT NULL,
    `seo_keywords` JSON NULL,
    `business_facilitated` DECIMAL(18, 2) NULL,
    `customers_served` INTEGER NULL,
    `customer_rating` DECIMAL(3, 2) NULL,
    `partner_since` DATETIME(3) NULL,
    `products_count` INTEGER NULL,
    `cities_covered` INTEGER NULL,
    `stats_verified` BOOLEAN NOT NULL DEFAULT false,
    `theme_preference` VARCHAR(10) NOT NULL DEFAULT 'light',
    `profile_views` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `partner_brand_profiles_partner_id_key`(`partner_id`),
    UNIQUE INDEX `partner_brand_profiles_slug_key`(`slug`),
    INDEX `partner_brand_profiles_is_published_city_state_idx`(`is_published`, `city`, `state`),
    INDEX `partner_brand_profiles_is_published_customer_rating_idx`(`is_published`, `customer_rating`),
    INDEX `partner_brand_profiles_slug_is_published_idx`(`slug`, `is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_expertises` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('HOME_LOAN', 'BUSINESS_LOAN', 'LOAN_AGAINST_PROPERTY', 'WORKING_CAPITAL', 'INSURANCE', 'CREDIT_CARDS', 'PERSONAL_LOAN', 'MSME_FINANCE', 'BUILDER_FUNDING', 'PROJECT_FINANCE', 'VEHICLE_LOAN') NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `partner_brand_expertises_profile_id_type_key`(`profile_id`, `type`),
    INDEX `partner_brand_expertises_profile_id_sort_order_idx`(`profile_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_achievements` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('TOP_PERFORMER', 'ELITE_PARTNER', 'CHAIRMANS_CIRCLE', 'PRESIDENT_CLUB', 'CERTIFIED_ADVISOR', 'LEADERSHIP_AWARD', 'BUSINESS_EXCELLENCE') NOT NULL,
    `title` VARCHAR(200) NULL,
    `description` TEXT NULL,
    `year` INTEGER NULL,
    `image_url` VARCHAR(500) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_achievements_profile_id_sort_order_idx`(`profile_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_certificates` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('KUBER_ACADEMY', 'PRODUCT', 'INSURANCE', 'SALES', 'LEADERSHIP', 'COMPLIANCE') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `issuer` VARCHAR(200) NULL,
    `issued_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `image_url` VARCHAR(500) NULL,
    `download_url` VARCHAR(500) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_certificates_profile_id_sort_order_idx`(`profile_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_reviews` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `reviewer_name` VARCHAR(150) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `photo_url` VARCHAR(500) NULL,
    `video_url` VARCHAR(500) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `reviewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_reviews_profile_id_is_verified_rating_idx`(`profile_id`, `is_verified`, `rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_media` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'ARTICLE', 'BLOG', 'SUCCESS_STORY') NOT NULL,
    `title` VARCHAR(300) NOT NULL,
    `description` TEXT NULL,
    `url` VARCHAR(500) NOT NULL,
    `thumbnail_url` VARCHAR(500) NULL,
    `published_at` DATETIME(3) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_media_profile_id_type_sort_order_idx`(`profile_id`, `type`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_gallery` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `category` ENUM('OFFICE', 'TEAM', 'CUSTOMER_MEETING', 'AWARD', 'EVENT', 'SEMINAR') NOT NULL,
    `title` VARCHAR(200) NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `caption` TEXT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_gallery_profile_id_category_sort_order_idx`(`profile_id`, `category`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_social_links` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `platform` ENUM('LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'X', 'TELEGRAM', 'YOUTUBE', 'WEBSITE') NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `partner_brand_social_links_profile_id_platform_key`(`profile_id`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_team_members` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(150) NULL,
    `photo_url` VARCHAR(500) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_team_members_profile_id_sort_order_idx`(`profile_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_badges` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('VERIFIED_PROFESSIONAL', 'KUBER_CERTIFIED', 'IDENTITY_VERIFIED', 'KYC_VERIFIED', 'ACADEMY_CERTIFIED', 'TOP_PERFORMER', 'OFFICE_VERIFIED', 'GST_VERIFIED', 'FAST_RESPONSE', 'TRUSTED_PROFESSIONAL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `awarded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `partner_brand_badges_profile_id_type_key`(`profile_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_brand_generated_content` (
    `id` CHAR(36) NOT NULL,
    `profile_id` CHAR(36) NOT NULL,
    `type` ENUM('BIOGRAPHY', 'LINKEDIN_SUMMARY', 'FACEBOOK_INTRO', 'INSTAGRAM_BIO', 'BUSINESS_DESCRIPTION', 'COMPANY_DESCRIPTION', 'SEO_TITLE', 'SEO_DESCRIPTION', 'ARTICLE', 'BLOG', 'REELS_CAPTION', 'SUCCESS_STORY', 'CASE_STUDY', 'LINKEDIN_POST', 'FACEBOOK_POST', 'INSTAGRAM_CAPTION', 'BUSINESS_QUOTE', 'MARKET_UPDATE', 'FINANCE_TIP', 'FESTIVAL_GREETING', 'BIRTHDAY_WISH', 'LOAN_AWARENESS', 'INSURANCE_AWARENESS') NOT NULL,
    `title` VARCHAR(300) NULL,
    `body` TEXT NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_brand_generated_content_profile_id_type_created_at_idx`(`profile_id`, `type`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `partner_brand_profiles` ADD CONSTRAINT `partner_brand_profiles_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_expertises` ADD CONSTRAINT `partner_brand_expertises_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_achievements` ADD CONSTRAINT `partner_brand_achievements_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_certificates` ADD CONSTRAINT `partner_brand_certificates_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_reviews` ADD CONSTRAINT `partner_brand_reviews_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_media` ADD CONSTRAINT `partner_brand_media_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_gallery` ADD CONSTRAINT `partner_brand_gallery_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_social_links` ADD CONSTRAINT `partner_brand_social_links_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_team_members` ADD CONSTRAINT `partner_brand_team_members_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_badges` ADD CONSTRAINT `partner_brand_badges_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_brand_generated_content` ADD CONSTRAINT `partner_brand_generated_content_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `partner_brand_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
