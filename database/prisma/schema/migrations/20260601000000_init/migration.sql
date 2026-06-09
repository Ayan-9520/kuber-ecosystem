-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL,
    `application_number` VARCHAR(30) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_PENDING', 'BANK_LOGIN', 'CREDIT_REVIEW', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `requested_amount` DECIMAL(15, 2) NOT NULL,
    `requested_tenure_months` INTEGER NOT NULL,
    `purpose` VARCHAR(200) NULL,
    `assigned_sales_id` CHAR(36) NULL,
    `assigned_credit_id` CHAR(36) NULL,
    `assigned_ops_id` CHAR(36) NULL,
    `selected_lender_id` CHAR(36) NULL,
    `approved_amount` DECIMAL(15, 2) NULL,
    `tenure_months` INTEGER NULL,
    `interest_rate` DECIMAL(5, 2) NULL,
    `emi_amount` DECIMAL(15, 2) NULL,
    `submitted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `disbursed_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `applications_application_number_key`(`application_number`),
    INDEX `applications_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `applications_status_created_at_idx`(`status`, `created_at`),
    INDEX `applications_branch_id_status_idx`(`branch_id`, `status`),
    INDEX `applications_assigned_sales_id_status_idx`(`assigned_sales_id`, `status`),
    INDEX `applications_partner_id_idx`(`partner_id`),
    INDEX `applications_submitted_at_idx`(`submitted_at`),
    INDEX `applications_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_status` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `from_status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_PENDING', 'BANK_LOGIN', 'CREDIT_REVIEW', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CLOSED') NULL,
    `to_status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_PENDING', 'BANK_LOGIN', 'CREDIT_REVIEW', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CLOSED') NOT NULL,
    `changed_by_id` CHAR(36) NOT NULL,
    `reason` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_status_application_id_created_at_idx`(`application_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_timeline` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `event_type` ENUM('STATUS_CHANGE', 'ASSIGNMENT', 'DOCUMENT', 'BANK_UPDATE', 'CREDIT_REVIEW', 'SANCTION', 'DISBURSEMENT', 'CLOSURE', 'NOTE') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `performed_by_id` CHAR(36) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_timeline_application_id_created_at_idx`(`application_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eligibility_results` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `result` ENUM('ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'NOT_ELIGIBLE') NOT NULL,
    `eligible_amount` DECIMAL(15, 2) NULL,
    `foir` DECIMAL(5, 2) NULL,
    `ltv` DECIMAL(5, 2) NULL,
    `dscr` DECIMAL(5, 2) NULL,
    `approval_probability` DECIMAL(5, 2) NULL,
    `risk_flags` JSON NULL,
    `recommended_lenders` JSON NULL,
    `rule_results` JSON NOT NULL,
    `engine_version` VARCHAR(20) NOT NULL,
    `checked_at` DATETIME(3) NOT NULL,
    `checked_by_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `eligibility_results_application_id_checked_at_idx`(`application_id`, `checked_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_logins` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `lender_id` CHAR(36) NOT NULL,
    `login_reference` VARCHAR(100) NULL,
    `login_date` DATETIME(3) NOT NULL,
    `submitted_by_id` CHAR(36) NOT NULL,
    `acknowledgment_received` BOOLEAN NOT NULL DEFAULT false,
    `acknowledgment_at` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'SUBMITTED', 'ACKNOWLEDGED', 'QUERY_RAISED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bank_logins_application_id_login_date_idx`(`application_id`, `login_date`),
    INDEX `bank_logins_lender_id_idx`(`lender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_reviews` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `reviewer_id` CHAR(36) NOT NULL,
    `review_type` ENUM('INTERNAL', 'LENDER_QUERY', 'REWORK') NOT NULL,
    `decision` ENUM('PENDING', 'APPROVED', 'REJECTED', 'QUERY') NOT NULL DEFAULT 'PENDING',
    `review_notes` TEXT NULL,
    `risk_indicators` JSON NULL,
    `risk_grade` ENUM('LOW', 'MEDIUM', 'HIGH') NULL,
    `cibil_score` INTEGER NULL,
    `conditions` TEXT NULL,
    `rejection_reason` VARCHAR(200) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `credit_reviews_application_id_created_at_idx`(`application_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanctions` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `lender_id` CHAR(36) NOT NULL,
    `sanction_amount` DECIMAL(15, 2) NOT NULL,
    `tenure_months` INTEGER NOT NULL,
    `interest_rate` DECIMAL(5, 2) NOT NULL,
    `processing_fee` DECIMAL(15, 2) NULL,
    `emi_amount` DECIMAL(15, 2) NULL,
    `sanction_date` DATE NOT NULL,
    `validity_date` DATE NULL,
    `conditions` TEXT NULL,
    `sanction_letter_key` VARCHAR(500) NULL,
    `status` ENUM('ISSUED', 'ACCEPTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sanctions_application_id_key`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disbursements` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `lender_id` CHAR(36) NOT NULL,
    `disbursement_amount` DECIMAL(15, 2) NOT NULL,
    `disbursement_date` DATE NOT NULL,
    `bank_reference` VARCHAR(50) NULL,
    `disbursement_mode` ENUM('FULL', 'PARTIAL', 'TRANCHE') NOT NULL DEFAULT 'FULL',
    `tranche_number` INTEGER NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `disbursements_application_id_disbursement_date_idx`(`application_id`, `disbursement_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `closures` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NOT NULL,
    `closure_type` ENUM('DISBURSED_COMPLETE', 'REJECTED', 'WITHDRAWN', 'CANCELLED') NOT NULL,
    `closure_date` DATE NOT NULL,
    `closure_reason` VARCHAR(200) NULL,
    `rm_assigned_id` CHAR(36) NULL,
    `archived_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `closures_application_id_key`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` CHAR(36) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `request_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_rules` (
    `id` CHAR(36) NOT NULL,
    `rule_code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `partner_type` ENUM('DSA', 'BUILDER', 'PROPERTY_DEALER', 'CA', 'BROKER', 'CORPORATE', 'CHANNEL_PARTNER') NULL,
    `commission_type` ENUM('LEAD_GENERATION', 'APPLICATION_LOGIN', 'SANCTION', 'DISBURSEMENT', 'RENEWAL', 'CROSS_SELL', 'CAMPAIGN_BONUS') NOT NULL,
    `calculation_method` ENUM('FIXED_AMOUNT', 'PERCENTAGE', 'SLAB_BASED', 'PRODUCT_BASED', 'LENDER_BASED', 'CAMPAIGN_BASED') NOT NULL,
    `fixed_amount` DECIMAL(15, 2) NULL,
    `percentage` DECIMAL(7, 4) NULL,
    `slab_definition` JSON NULL,
    `product_id` CHAR(36) NULL,
    `lender_id` CHAR(36) NULL,
    `campaign_id` VARCHAR(36) NULL,
    `min_base_amount` DECIMAL(15, 2) NULL,
    `max_base_amount` DECIMAL(15, 2) NULL,
    `min_commission` DECIMAL(15, 2) NULL,
    `max_commission` DECIMAL(15, 2) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_rules_rule_code_key`(`rule_code`),
    INDEX `commission_rules_commission_type_is_active_idx`(`commission_type`, `is_active`),
    INDEX `commission_rules_partner_type_is_active_idx`(`partner_type`, `is_active`),
    INDEX `commission_rules_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_ledger` (
    `id` CHAR(36) NOT NULL,
    `ledger_number` VARCHAR(30) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `commission_type` ENUM('LEAD_GENERATION', 'APPLICATION_LOGIN', 'SANCTION', 'DISBURSEMENT', 'RENEWAL', 'CROSS_SELL', 'CAMPAIGN_BONUS') NOT NULL,
    `entry_type` ENUM('CREDIT', 'DEBIT', 'ADJUSTMENT', 'RECOVERY', 'PAYMENT') NOT NULL DEFAULT 'CREDIT',
    `status` ENUM('PENDING', 'CALCULATED', 'APPROVED', 'REJECTED', 'PAID', 'RECOVERED', 'ADJUSTED') NOT NULL DEFAULT 'PENDING',
    `base_amount` DECIMAL(15, 2) NOT NULL,
    `commission_amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `rule_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `referral_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `lender_id` CHAR(36) NULL,
    `campaign_id` VARCHAR(36) NULL,
    `calculation_method` ENUM('FIXED_AMOUNT', 'PERCENTAGE', 'SLAB_BASED', 'PRODUCT_BASED', 'LENDER_BASED', 'CAMPAIGN_BASED') NULL,
    `calculation_details` JSON NULL,
    `notes` TEXT NULL,
    `metadata` JSON NULL,
    `calculated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_ledger_ledger_number_key`(`ledger_number`),
    INDEX `commission_ledger_partner_id_status_idx`(`partner_id`, `status`),
    INDEX `commission_ledger_commission_type_status_idx`(`commission_type`, `status`),
    INDEX `commission_ledger_branch_id_created_at_idx`(`branch_id`, `created_at`),
    INDEX `commission_ledger_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_approvals` (
    `id` CHAR(36) NOT NULL,
    `approval_number` VARCHAR(30) NOT NULL,
    `ledger_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requested_amount` DECIMAL(15, 2) NOT NULL,
    `approved_amount` DECIMAL(15, 2) NULL,
    `notes` TEXT NULL,
    `rejection_reason` VARCHAR(500) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `requested_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_approvals_approval_number_key`(`approval_number`),
    INDEX `commission_approvals_ledger_id_status_idx`(`ledger_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_payments` (
    `id` CHAR(36) NOT NULL,
    `payment_number` VARCHAR(30) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('PENDING', 'APPROVED', 'RELEASED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_method` VARCHAR(50) NULL,
    `payment_reference` VARCHAR(100) NULL,
    `bank_account_ref` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `released_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `released_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_payments_payment_number_key`(`payment_number`),
    INDEX `commission_payments_partner_id_status_idx`(`partner_id`, `status`),
    INDEX `commission_payments_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_payment_items` (
    `id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `ledger_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `commission_payment_items_payment_id_ledger_id_key`(`payment_id`, `ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_adjustments` (
    `id` CHAR(36) NOT NULL,
    `adjustment_number` VARCHAR(30) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `ledger_id` CHAR(36) NULL,
    `entry_type` ENUM('CREDIT', 'DEBIT', 'ADJUSTMENT', 'RECOVERY', 'PAYMENT') NOT NULL DEFAULT 'ADJUSTMENT',
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'APPLIED') NOT NULL DEFAULT 'PENDING',
    `reason` VARCHAR(500) NOT NULL,
    `notes` TEXT NULL,
    `applied_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_adjustments_adjustment_number_key`(`adjustment_number`),
    INDEX `commission_adjustments_partner_id_status_idx`(`partner_id`, `status`),
    INDEX `commission_adjustments_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_recoveries` (
    `id` CHAR(36) NOT NULL,
    `recovery_number` VARCHAR(30) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `ledger_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'RECOVERED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `reason` VARCHAR(500) NOT NULL,
    `notes` TEXT NULL,
    `recovered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `commission_recoveries_recovery_number_key`(`recovery_number`),
    INDEX `commission_recoveries_partner_id_status_idx`(`partner_id`, `status`),
    INDEX `commission_recoveries_ledger_id_idx`(`ledger_id`),
    INDEX `commission_recoveries_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `customer_code` VARCHAR(20) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NULL,
    `full_name` VARCHAR(200) NOT NULL,
    `date_of_birth` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL,
    `marital_status` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') NULL,
    `profile_completion_pct` INTEGER NOT NULL DEFAULT 0,
    `kyc_status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'NOT_STARTED',
    `rm_employee_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `source` ENUM('DIRECT', 'DSA', 'REFERRAL', 'CAMPAIGN', 'WALK_IN') NOT NULL DEFAULT 'DIRECT',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `customers_user_id_key`(`user_id`),
    UNIQUE INDEX `customers_customer_code_key`(`customer_code`),
    INDEX `customers_branch_id_idx`(`branch_id`),
    INDEX `customers_kyc_status_idx`(`kyc_status`),
    INDEX `customers_full_name_idx`(`full_name`),
    INDEX `customers_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_profiles` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `photo_s3_key` VARCHAR(500) NULL,
    `alternate_phone` VARCHAR(15) NULL,
    `alternate_email` VARCHAR(255) NULL,
    `preferred_language` ENUM('EN', 'HI', 'TA', 'TE', 'MR', 'BN', 'GU', 'KN', 'ML') NOT NULL DEFAULT 'EN',
    `preferred_contact_channel` ENUM('SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'CALL') NOT NULL DEFAULT 'WHATSAPP',
    `nationality` VARCHAR(50) NOT NULL DEFAULT 'INDIA',
    `residential_status` ENUM('RESIDENT', 'NRI', 'PIO') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `customer_profiles_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_addresses` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `address_type` ENUM('CURRENT', 'PERMANENT', 'OFFICE', 'PROPERTY') NOT NULL,
    `line1` VARCHAR(255) NOT NULL,
    `line2` VARCHAR(255) NULL,
    `landmark` VARCHAR(100) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state_id` CHAR(36) NULL,
    `state_name` VARCHAR(100) NOT NULL,
    `pincode` VARCHAR(10) NOT NULL,
    `country_id` CHAR(36) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `customer_addresses_customer_id_idx`(`customer_id`),
    INDEX `customer_addresses_pincode_idx`(`pincode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_employment` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `employment_type` ENUM('SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'PROFESSIONAL', 'RETIRED', 'OTHER') NOT NULL,
    `employer_name` VARCHAR(200) NULL,
    `designation` VARCHAR(100) NULL,
    `industry_id` CHAR(36) NULL,
    `occupation_id` CHAR(36) NULL,
    `years_in_current_job` DECIMAL(4, 1) NULL,
    `total_experience_years` DECIMAL(4, 1) NULL,
    `office_address_id` CHAR(36) NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT true,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `customer_employment_customer_id_idx`(`customer_id`),
    INDEX `customer_employment_customer_id_is_current_idx`(`customer_id`, `is_current`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_income` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `employment_id` CHAR(36) NULL,
    `income_type` ENUM('MONTHLY_SALARY', 'ANNUAL_INCOME', 'BUSINESS_INCOME', 'RENTAL', 'OTHER') NOT NULL,
    `gross_amount` DECIMAL(15, 2) NOT NULL,
    `net_amount` DECIMAL(15, 2) NULL,
    `frequency` ENUM('MONTHLY', 'ANNUAL') NOT NULL DEFAULT 'MONTHLY',
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `declared_at` DATETIME(3) NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `customer_income_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_preferences` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `push_enabled` BOOLEAN NOT NULL DEFAULT true,
    `sms_enabled` BOOLEAN NOT NULL DEFAULT true,
    `email_enabled` BOOLEAN NOT NULL DEFAULT true,
    `whatsapp_enabled` BOOLEAN NOT NULL DEFAULT true,
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,
    `ai_advisor_enabled` BOOLEAN NOT NULL DEFAULT true,
    `voice_ai_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `customer_preferences_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_consents` (
    `id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `consent_type` ENUM('TERMS', 'PRIVACY', 'KYC', 'CREDIT_CHECK', 'MARKETING', 'DATA_SHARING') NOT NULL,
    `consent_version` VARCHAR(20) NOT NULL,
    `granted` BOOLEAN NOT NULL,
    `granted_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,

    INDEX `customer_consents_customer_id_consent_type_idx`(`customer_id`, `consent_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` CHAR(36) NOT NULL,
    `document_code` VARCHAR(30) NOT NULL,
    `owner_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EMPLOYEE') NOT NULL,
    `customer_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `document_type_id` CHAR(36) NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `current_version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('UPLOADED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'DEFICIENT', 'EXPIRED') NOT NULL DEFAULT 'UPLOADED',
    `metadata` JSON NULL,
    `expires_at` DATETIME(3) NULL,
    `uploaded_by_id` CHAR(36) NOT NULL,
    `verified_by_id` CHAR(36) NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by_id` CHAR(36) NULL,

    UNIQUE INDEX `documents_document_code_key`(`document_code`),
    INDEX `documents_application_id_document_type_id_idx`(`application_id`, `document_type_id`),
    INDEX `documents_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `documents_lead_id_idx`(`lead_id`),
    INDEX `documents_status_created_at_idx`(`status`, `created_at`),
    INDEX `documents_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_versions` (
    `id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `version_number` INTEGER NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `upload_reason` ENUM('INITIAL', 'REUPLOAD', 'CORRECTION') NOT NULL DEFAULT 'INITIAL',
    `metadata` JSON NULL,
    `uploaded_by_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `document_versions_document_id_idx`(`document_id`),
    UNIQUE INDEX `document_versions_document_id_version_number_key`(`document_id`, `version_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_requests` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `customer_id` CHAR(36) NULL,
    `document_type_id` CHAR(36) NOT NULL,
    `requested_by_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'FULFILLED', 'WAIVED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `due_date` DATE NULL,
    `reminder_count` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `fulfilled_document_id` CHAR(36) NULL,
    `fulfilled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `document_requests_application_id_status_idx`(`application_id`, `status`),
    INDEX `document_requests_customer_id_status_idx`(`customer_id`, `status`),
    INDEX `document_requests_due_date_idx`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ocr_results` (
    `id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `document_version_id` CHAR(36) NULL,
    `extracted_name` VARCHAR(200) NULL,
    `pan_number_enc` TEXT NULL,
    `pan_number_masked` VARCHAR(15) NULL,
    `aadhaar_number_enc` TEXT NULL,
    `aadhaar_number_masked` VARCHAR(20) NULL,
    `date_of_birth` DATE NULL,
    `address` TEXT NULL,
    `gst_number` VARCHAR(20) NULL,
    `vehicle_number` VARCHAR(20) NULL,
    `property_details` JSON NULL,
    `extracted_fields` JSON NOT NULL,
    `confidence_score` DECIMAL(5, 2) NOT NULL,
    `raw_response` JSON NULL,
    `provider` ENUM('INTERNAL', 'AWS_TEXTRACT', 'THIRD_PARTY') NOT NULL DEFAULT 'INTERNAL',
    `processed_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ocr_results_document_id_processed_at_idx`(`document_id`, `processed_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_results` (
    `id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `verified_by_id` CHAR(36) NULL,
    `mode` ENUM('AUTO', 'MANUAL') NOT NULL DEFAULT 'MANUAL',
    `result` ENUM('APPROVED', 'REJECTED', 'NEEDS_REVIEW') NOT NULL,
    `rejection_reason` VARCHAR(200) NULL,
    `notes` TEXT NULL,
    `risk_flags` JSON NULL,
    `mismatches` JSON NULL,
    `verified_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `verification_results_document_id_verified_at_idx`(`document_id`, `verified_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_deficiencies` (
    `id` CHAR(36) NOT NULL,
    `application_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `customer_id` CHAR(36) NULL,
    `document_request_id` CHAR(36) NULL,
    `document_id` CHAR(36) NULL,
    `deficiency_type` ENUM('MISSING', 'ILLEGIBLE', 'EXPIRED', 'MISMATCH', 'INSUFFICIENT') NOT NULL,
    `description` TEXT NOT NULL,
    `raised_by_id` CHAR(36) NOT NULL,
    `status` ENUM('OPEN', 'RESOLVED', 'WAIVED') NOT NULL DEFAULT 'OPEN',
    `resolved_at` DATETIME(3) NULL,
    `notification_sent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `document_deficiencies_application_id_status_idx`(`application_id`, `status`),
    INDEX `document_deficiencies_customer_id_status_idx`(`customer_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presigned_upload_intents` (
    `id` CHAR(36) NOT NULL,
    `upload_token` VARCHAR(36) NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `requested_by_id` CHAR(36) NOT NULL,
    `document_type_id` CHAR(36) NOT NULL,
    `owner_type` ENUM('CUSTOMER', 'LEAD', 'APPLICATION', 'PARTNER', 'EMPLOYEE') NOT NULL,
    `customer_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `presigned_upload_intents_upload_token_key`(`upload_token`),
    UNIQUE INDEX `presigned_upload_intents_s3_key_key`(`s3_key`),
    INDEX `presigned_upload_intents_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_calculations` (
    `id` CHAR(36) NOT NULL,
    `calculation_kind` ENUM('EMI', 'ELIGIBILITY', 'SAVINGS', 'LOAN_COMPARISON', 'APPROVAL_PROBABILITY') NOT NULL,
    `product_slug` ENUM('HOME_LOAN', 'HOME_LOAN_BT', 'HOME_LOAN_TOP_UP', 'HOME_LOAN_BT_TOP_UP', 'LAP', 'LAP_BT', 'LAP_TOP_UP', 'LAP_BT_TOP_UP', 'BUSINESS_LOAN', 'MSME_LOAN', 'WORKING_CAPITAL', 'OD', 'CC', 'NEW_CAR_LOAN', 'USED_CAR_LOAN', 'COMMERCIAL_VEHICLE', 'EV_LOAN', 'CAR_LOAN_BT', 'CAR_LOAN_TOP_UP', 'CAR_REFINANCE') NULL,
    `product_id` CHAR(36) NULL,
    `variant_id` CHAR(36) NULL,
    `customer_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `cache_key` VARCHAR(64) NULL,
    `input_payload` JSON NOT NULL,
    `output_payload` JSON NOT NULL,
    `engine_version` VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    `computed_by` CHAR(36) NULL,
    `ip_address` VARCHAR(45) NULL,
    `request_id` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `finance_calculations_cache_key_key`(`cache_key`),
    INDEX `finance_calculations_calculation_kind_created_at_idx`(`calculation_kind`, `created_at`),
    INDEX `finance_calculations_customer_id_idx`(`customer_id`),
    INDEX `finance_calculations_product_slug_idx`(`product_slug`),
    INDEX `finance_calculations_application_id_idx`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(15) NULL,
    `password_hash` VARCHAR(255) NULL,
    `user_type` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_user_type_status_idx`(`user_type`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `module` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_code_key`(`code`),
    INDEX `permissions_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` CHAR(36) NOT NULL,
    `permission_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_roles_user_id_role_id_branch_id_key`(`user_id`, `role_id`, `branch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sessions_user_id_expires_at_idx`(`user_id`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `refresh_tokens_user_id_expires_at_idx`(`user_id`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NULL,
    `phone` VARCHAR(15) NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `purpose` VARCHAR(30) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `verified_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `otp_verifications_phone_purpose_expires_at_idx`(`phone`, `purpose`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `devices` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `device_id` VARCHAR(100) NOT NULL,
    `platform` VARCHAR(20) NOT NULL,
    `fcm_token` VARCHAR(500) NULL,
    `app_version` VARCHAR(20) NULL,
    `last_active_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `devices_user_id_device_id_key`(`user_id`, `device_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_history` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `session_id` CHAR(36) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `fail_reason` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_history_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_profiles` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('CUSTOMER', 'PARTNER') NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `pan_encrypted` TEXT NULL,
    `pan_masked` VARCHAR(10) NULL,
    `pan_verified` BOOLEAN NOT NULL DEFAULT false,
    `pan_verified_at` DATETIME(3) NULL,
    `aadhaar_encrypted` TEXT NULL,
    `aadhaar_masked` VARCHAR(12) NULL,
    `aadhaar_verified` BOOLEAN NOT NULL DEFAULT false,
    `aadhaar_verified_at` DATETIME(3) NULL,
    `ckyc_number` VARCHAR(20) NULL,
    `photo_s3_key` VARCHAR(500) NULL,
    `address_proof_status` ENUM('NOT_SUBMITTED', 'SUBMITTED', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'NOT_SUBMITTED',
    `overall_status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'NOT_STARTED',
    `completion_pct` INTEGER NOT NULL DEFAULT 0,
    `expires_at` DATETIME(3) NULL,
    `last_reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `kyc_profiles_overall_status_idx`(`overall_status`),
    INDEX `kyc_profiles_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    UNIQUE INDEX `kyc_profiles_entity_type_entity_id_key`(`entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pan_verifications` (
    `id` CHAR(36) NOT NULL,
    `kyc_profile_id` CHAR(36) NOT NULL,
    `pan_encrypted` TEXT NOT NULL,
    `pan_masked` VARCHAR(10) NOT NULL,
    `name_on_pan` VARCHAR(200) NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'FAILED', 'NAME_MISMATCH') NOT NULL,
    `verification_provider` ENUM('NSDL', 'KARZA', 'MANUAL') NOT NULL,
    `provider_reference` VARCHAR(100) NULL,
    `verified_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,

    INDEX `pan_verifications_kyc_profile_id_created_at_idx`(`kyc_profile_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aadhaar_verifications` (
    `id` CHAR(36) NOT NULL,
    `kyc_profile_id` CHAR(36) NOT NULL,
    `aadhaar_encrypted` TEXT NOT NULL,
    `aadhaar_masked` VARCHAR(12) NOT NULL,
    `verification_method` ENUM('OTP', 'OFFLINE_XML', 'VIDEO_KYC') NOT NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'FAILED') NOT NULL,
    `provider_reference` VARCHAR(100) NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` CHAR(36) NULL,

    INDEX `aadhaar_verifications_kyc_profile_id_created_at_idx`(`kyc_profile_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kyc_audit_logs` (
    `id` CHAR(36) NOT NULL,
    `kyc_profile_id` CHAR(36) NOT NULL,
    `action` ENUM('VERIFY', 'REJECT', 'EXPIRE', 'RE_VERIFY', 'OVERRIDE') NOT NULL,
    `performed_by_id` CHAR(36) NOT NULL,
    `previous_status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'REJECTED', 'EXPIRED') NULL,
    `new_status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'REJECTED', 'EXPIRED') NOT NULL,
    `reason` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `kyc_audit_logs_kyc_profile_id_created_at_idx`(`kyc_profile_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_sources` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `channel` ENUM('DIGITAL', 'PARTNER', 'DIRECT', 'INBOUND') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lead_sources_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` CHAR(36) NOT NULL,
    `lead_number` VARCHAR(30) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `prospect_name` VARCHAR(200) NOT NULL,
    `prospect_phone` VARCHAR(15) NOT NULL,
    `prospect_email` VARCHAR(255) NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_id` CHAR(36) NULL,
    `source_id` CHAR(36) NOT NULL,
    `partner_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'DOCUMENT_PENDING', 'IN_PROCESS', 'APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `grade` ENUM('A_PLUS', 'A', 'B', 'C', 'REJECTED') NULL,
    `score` DECIMAL(5, 2) NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `requested_amount` DECIMAL(15, 2) NULL,
    `assigned_to_id` CHAR(36) NULL,
    `sla_deadline` DATETIME(3) NULL,
    `converted_at` DATETIME(3) NULL,
    `lost_reason` VARCHAR(200) NULL,
    `metadata` JSON NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `leads_lead_number_key`(`lead_number`),
    INDEX `leads_status_grade_idx`(`status`, `grade`),
    INDEX `leads_partner_id_created_at_idx`(`partner_id`, `created_at`),
    INDEX `leads_assigned_to_id_status_idx`(`assigned_to_id`, `status`),
    INDEX `leads_branch_id_status_created_at_idx`(`branch_id`, `status`, `created_at`),
    INDEX `leads_source_id_idx`(`source_id`),
    INDEX `leads_prospect_phone_idx`(`prospect_phone`),
    INDEX `leads_sla_deadline_idx`(`sla_deadline`),
    INDEX `leads_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_scores` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `score` INTEGER NOT NULL,
    `grade` ENUM('A_PLUS', 'A', 'B', 'C', 'REJECTED') NOT NULL,
    `rule_score` INTEGER NULL,
    `ai_score` INTEGER NULL,
    `approval_probability` DECIMAL(5, 2) NULL,
    `risk_indicators` JSON NULL,
    `factor_breakdown` JSON NOT NULL,
    `model_version` VARCHAR(20) NOT NULL,
    `calculated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_scores_lead_id_calculated_at_idx`(`lead_id`, `calculated_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_assignments` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `assigned_to_id` CHAR(36) NOT NULL,
    `assigned_by_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `assignment_type` ENUM('AUTO', 'MANUAL', 'ROUND_ROBIN', 'LOAD_BALANCE', 'ESCALATION', 'BRANCH') NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL,
    `unassigned_at` DATETIME(3) NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_assignments_lead_id_is_current_idx`(`lead_id`, `is_current`),
    INDEX `lead_assignments_assigned_to_id_is_current_idx`(`assigned_to_id`, `is_current`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_status_history` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `from_status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'DOCUMENT_PENDING', 'IN_PROCESS', 'APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'LOST') NULL,
    `to_status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'DOCUMENT_PENDING', 'IN_PROCESS', 'APPLICATION_CREATED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'LOST') NOT NULL,
    `changed_by_id` CHAR(36) NOT NULL,
    `reason` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_status_history_lead_id_created_at_idx`(`lead_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_activities` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `activity_type` ENUM('CALL', 'SMS', 'EMAIL', 'WHATSAPP', 'MEETING', 'NOTE', 'STATUS_CHANGE', 'ASSIGNMENT', 'DOCUMENT') NOT NULL,
    `performed_by_id` CHAR(36) NOT NULL,
    `description` TEXT NULL,
    `disposition` ENUM('CONNECTED', 'NO_ANSWER', 'CALLBACK', 'NOT_INTERESTED', 'INTERESTED', 'BUSY', 'WRONG_NUMBER') NULL,
    `duration_seconds` INTEGER NULL,
    `scheduled_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_activities_lead_id_created_at_idx`(`lead_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_notes` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lead_notes_lead_id_created_at_idx`(`lead_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_followups` (
    `id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `assigned_to_id` CHAR(36) NOT NULL,
    `followup_type` ENUM('CALL', 'WHATSAPP', 'SMS', 'EMAIL', 'MEETING', 'DOCUMENT_REQUEST') NOT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `completed_at` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'MISSED', 'CANCELLED', 'ESCALATED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `reminder_sent` BOOLEAN NOT NULL DEFAULT false,
    `escalated_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lead_followups_assigned_to_id_scheduled_at_idx`(`assigned_to_id`, `scheduled_at`),
    INDEX `lead_followups_lead_id_status_idx`(`lead_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `id` CHAR(36) NOT NULL,
    `iso_code` CHAR(2) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone_code` VARCHAR(5) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `countries_iso_code_key`(`iso_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` CHAR(36) NOT NULL,
    `country_id` CHAR(36) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `states_country_id_idx`(`country_id`),
    UNIQUE INDEX `states_country_id_code_key`(`country_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` CHAR(36) NOT NULL,
    `state_id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `tier` ENUM('TIER_1', 'TIER_2', 'TIER_3') NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cities_state_id_idx`(`state_id`),
    INDEX `cities_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occupations` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('SALARIED', 'SELF_EMPLOYED', 'PROFESSIONAL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `occupations_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `industries` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `sector` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `industries_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banks` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `ifsc_prefix` VARCHAR(4) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `banks_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_manufacturers` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `country_of_origin` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicle_manufacturers_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_models` (
    `id` CHAR(36) NOT NULL,
    `manufacturer_id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('HATCHBACK', 'SEDAN', 'SUV', 'MUV', 'LUXURY', 'COMMERCIAL', 'TWO_WHEELER', 'OTHER') NOT NULL,
    `fuel_types` JSON NULL,
    `is_electric` BOOLEAN NOT NULL DEFAULT false,
    `ex_showroom_price_min` DECIMAL(15, 2) NULL,
    `ex_showroom_price_max` DECIMAL(15, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vehicle_models_manufacturer_id_idx`(`manufacturer_id`),
    UNIQUE INDEX `vehicle_models_manufacturer_id_code_key`(`manufacturer_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `parent_template_id` CHAR(36) NULL,
    `subject` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `variables` JSON NOT NULL,
    `metadata` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `notification_templates_event_type_channel_is_active_idx`(`event_type`, `channel`, `is_active`),
    INDEX `notification_templates_deleted_at_idx`(`deleted_at`),
    UNIQUE INDEX `notification_templates_code_version_key`(`code`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_user_id_event_type_channel_key`(`user_id`, `event_type`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL DEFAULT 'IN_APP',
    `template_id` CHAR(36) NULL,
    `title` VARCHAR(300) NOT NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `entity_type` VARCHAR(50) NULL,
    `entity_id` CHAR(36) NULL,
    `read_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `notifications_user_id_status_created_at_idx`(`user_id`, `status`, `created_at`),
    INDEX `notifications_event_type_idx`(`event_type`),
    INDEX `notifications_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_logs` (
    `id` CHAR(36) NOT NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NULL,
    `template_id` CHAR(36) NULL,
    `recipient_user_id` CHAR(36) NULL,
    `recipient_address` VARCHAR(255) NULL,
    `subject` VARCHAR(500) NULL,
    `payload` JSON NULL,
    `rendered_body` TEXT NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider_ref` VARCHAR(200) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `opened_at` DATETIME(3) NULL,
    `clicked_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `entity_type` VARCHAR(50) NULL,
    `entity_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `communication_logs_channel_status_created_at_idx`(`channel`, `status`, `created_at`),
    INDEX `communication_logs_recipient_user_id_idx`(`recipient_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `recipient_user_id` CHAR(36) NULL,
    `to_email` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider_ref` VARCHAR(200) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `email_logs_to_email_status_idx`(`to_email`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sms_logs` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `recipient_user_id` CHAR(36) NULL,
    `to_phone` VARCHAR(15) NOT NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider_ref` VARCHAR(200) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sms_logs_to_phone_status_idx`(`to_phone`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whatsapp_logs` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `recipient_user_id` CHAR(36) NULL,
    `to_phone` VARCHAR(15) NOT NULL,
    `template_name` VARCHAR(100) NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider_ref` VARCHAR(200) NULL,
    `delivery_status` VARCHAR(50) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `whatsapp_logs_to_phone_status_idx`(`to_phone`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_notifications` (
    `id` CHAR(36) NOT NULL,
    `template_id` CHAR(36) NULL,
    `user_id` CHAR(36) NOT NULL,
    `device_id` CHAR(36) NULL,
    `fcm_token` VARCHAR(500) NULL,
    `title` VARCHAR(300) NOT NULL,
    `body` TEXT NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `provider_ref` VARCHAR(200) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(500) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `push_notifications_user_id_status_idx`(`user_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_queue` (
    `id` CHAR(36) NOT NULL,
    `queue_type` ENUM('NOTIFICATION', 'RETRY', 'FAILED', 'SCHEDULED') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SCHEDULED') NOT NULL DEFAULT 'PENDING',
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH') NOT NULL,
    `event_type` ENUM('LEAD_CREATED', 'LEAD_ASSIGNED', 'LEAD_QUALIFIED', 'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 'DOCUMENT_REQUESTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'ELIGIBILITY_GENERATED', 'SANCTION_ISSUED', 'DISBURSEMENT_COMPLETED', 'REFERRAL_CREATED', 'REFERRAL_CONVERTED', 'REWARD_APPROVED', 'COMMISSION_APPROVED', 'COMMISSION_PAID', 'SUPPORT_TICKET_CREATED', 'SUPPORT_TICKET_CLOSED', 'LOGIN_OTP', 'PASSWORD_RESET') NOT NULL,
    `recipient_user_id` CHAR(36) NULL,
    `payload` JSON NOT NULL,
    `scheduled_at` DATETIME(3) NULL,
    `processed_at` DATETIME(3) NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `last_error` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notification_queue_queue_type_status_scheduled_at_idx`(`queue_type`, `status`, `scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `id` CHAR(36) NOT NULL,
    `region_id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `branches_code_key`(`code`),
    INDEX `branches_region_id_is_active_idx`(`region_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
    `employee_code` VARCHAR(30) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `designation` VARCHAR(100) NULL,
    `department` VARCHAR(50) NULL,
    `reports_to_id` CHAR(36) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `joined_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `employees_user_id_key`(`user_id`),
    UNIQUE INDEX `employees_employee_code_key`(`employee_code`),
    INDEX `employees_branch_id_is_active_idx`(`branch_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_types` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `partner_types_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partners` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `partner_type_id` CHAR(36) NOT NULL,
    `partner_code` VARCHAR(30) NOT NULL,
    `business_name` VARCHAR(200) NULL,
    `contact_name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `email` VARCHAR(255) NULL,
    `kyc_status` VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `commission_tier` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `partners_user_id_key`(`user_id`),
    UNIQUE INDEX `partners_partner_code_key`(`partner_code`),
    INDEX `partners_partner_type_id_status_idx`(`partner_type_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_families` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_secured` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `product_families_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` CHAR(36) NOT NULL,
    `family_id` CHAR(36) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `min_amount` DECIMAL(15, 2) NOT NULL,
    `max_amount` DECIMAL(15, 2) NOT NULL,
    `min_tenure_months` INTEGER NOT NULL,
    `max_tenure_months` INTEGER NOT NULL,
    `min_interest_rate` DECIMAL(5, 2) NULL,
    `max_interest_rate` DECIMAL(5, 2) NULL,
    `priority` ENUM('P0', 'P1', 'P2', 'P3') NOT NULL DEFAULT 'P1',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `launch_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `products_code_key`(`code`),
    INDEX `products_family_id_idx`(`family_id`),
    INDEX `products_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_code` ENUM('FRESH', 'BT', 'TOP_UP', 'BT_TOP_UP', 'WORKING_CAPITAL', 'OD', 'CC') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `product_variants_product_id_variant_code_key`(`product_id`, `variant_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eligibility_rules` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_id` CHAR(36) NULL,
    `rule_name` VARCHAR(100) NOT NULL,
    `rule_type` ENUM('AGE', 'INCOME', 'FOIR', 'LTV', 'CIBIL', 'EMPLOYMENT', 'CUSTOM') NOT NULL,
    `rule_definition` JSON NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `eligibility_rules_product_id_idx`(`product_id`),
    INDEX `eligibility_rules_product_id_is_active_idx`(`product_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_types` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` ENUM('KYC', 'INCOME', 'PROPERTY', 'VEHICLE', 'BUSINESS', 'AGREEMENT', 'IDENTITY', 'OTHER') NOT NULL,
    `allowed_mime_types` JSON NOT NULL,
    `max_size_mb` INTEGER NOT NULL,
    `requires_ocr` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_types_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_rules` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_id` CHAR(36) NULL,
    `document_type_id` CHAR(36) NOT NULL,
    `is_mandatory` BOOLEAN NOT NULL DEFAULT true,
    `stage` ENUM('S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09') NOT NULL DEFAULT 'S03',
    `employment_type` ENUM('SALARIED', 'SELF_EMPLOYED', 'BUSINESS_OWNER', 'PROFESSIONAL', 'RETIRED', 'OTHER') NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `document_rules_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lenders` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `lender_type` ENUM('BANK', 'NBFC', 'HFC') NOT NULL,
    `contact_email` VARCHAR(255) NULL,
    `integration_type` ENUM('MANUAL', 'API', 'EMAIL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `lenders_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lender_policies` (
    `id` CHAR(36) NOT NULL,
    `lender_id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `min_amount` DECIMAL(15, 2) NOT NULL,
    `max_amount` DECIMAL(15, 2) NOT NULL,
    `max_ltv` DECIMAL(5, 2) NULL,
    `max_foir` DECIMAL(5, 2) NULL,
    `min_cibil` INTEGER NULL,
    `processing_fee_pct` DECIMAL(5, 2) NULL,
    `commission_rate` DECIMAL(5, 2) NULL,
    `turnaround_days` INTEGER NULL,
    `policy_s3_key` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `lender_policies_product_id_idx`(`product_id`),
    UNIQUE INDEX `lender_policies_lender_id_product_id_effective_from_key`(`lender_id`, `product_id`, `effective_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_lender_mappings` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `variant_id` CHAR(36) NULL,
    `lender_id` CHAR(36) NOT NULL,
    `lender_policy_id` CHAR(36) NULL,
    `eligibility_rule_ids` JSON NULL,
    `document_rule_ids` JSON NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `config` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    INDEX `product_lender_mappings_product_id_idx`(`product_id`),
    INDEX `product_lender_mappings_lender_id_idx`(`lender_id`),
    UNIQUE INDEX `product_lender_mappings_product_id_variant_id_lender_id_key`(`product_id`, `variant_id`, `lender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_types` (
    `id` CHAR(36) NOT NULL,
    `code` ENUM('CUSTOMER', 'DSA', 'BUILDER', 'PROPERTY_DEALER', 'CA', 'BROKER', 'CORPORATE') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `default_reward_pct` DECIMAL(5, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `referral_types_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referrals` (
    `id` CHAR(36) NOT NULL,
    `referral_number` VARCHAR(30) NOT NULL,
    `referral_code` VARCHAR(20) NOT NULL,
    `referral_type_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `referrer_customer_id` CHAR(36) NULL,
    `referrer_partner_id` CHAR(36) NULL,
    `referrer_employee_id` CHAR(36) NULL,
    `referrer_name` VARCHAR(200) NOT NULL,
    `referrer_phone` VARCHAR(15) NULL,
    `referrer_email` VARCHAR(255) NULL,
    `referee_name` VARCHAR(200) NOT NULL,
    `referee_phone` VARCHAR(15) NOT NULL,
    `referee_email` VARCHAR(255) NULL,
    `customer_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `product_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `requested_amount` DECIMAL(15, 2) NULL,
    `reward_amount` DECIMAL(15, 2) NULL,
    `reward_status` ENUM('NOT_APPLICABLE', 'PENDING', 'APPROVED', 'PAID', 'REJECTED') NOT NULL DEFAULT 'NOT_APPLICABLE',
    `notes` TEXT NULL,
    `rejection_reason` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `expires_at` DATETIME(3) NULL,
    `converted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `referrals_referral_number_key`(`referral_number`),
    UNIQUE INDEX `referrals_referral_code_key`(`referral_code`),
    INDEX `referrals_referral_type_id_status_idx`(`referral_type_id`, `status`),
    INDEX `referrals_referrer_customer_id_idx`(`referrer_customer_id`),
    INDEX `referrals_referrer_partner_id_idx`(`referrer_partner_id`),
    INDEX `referrals_referee_phone_idx`(`referee_phone`),
    INDEX `referrals_status_created_at_idx`(`status`, `created_at`),
    INDEX `referrals_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_categories` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ticket_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` CHAR(36) NOT NULL,
    `ticket_number` VARCHAR(30) NOT NULL,
    `subject` VARCHAR(300) NOT NULL,
    `description` TEXT NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'PENDING_INTERNAL', 'RESOLVED', 'CLOSED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `customer_id` CHAR(36) NULL,
    `partner_id` CHAR(36) NULL,
    `application_id` CHAR(36) NULL,
    `lead_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `assigned_to_id` CHAR(36) NULL,
    `assigned_user_id` CHAR(36) NULL,
    `escalation_level` ENUM('L1_SUPPORT', 'L2_SUPPORT', 'SUPPORT_MANAGER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'ADMIN') NOT NULL DEFAULT 'L1_SUPPORT',
    `response_sla_due_at` DATETIME(3) NULL,
    `resolution_sla_due_at` DATETIME(3) NULL,
    `escalation_sla_due_at` DATETIME(3) NULL,
    `first_response_at` DATETIME(3) NULL,
    `resolved_at` DATETIME(3) NULL,
    `closed_at` DATETIME(3) NULL,
    `sla_breached` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `deleted_at` DATETIME(3) NULL,
    `deleted_by` CHAR(36) NULL,

    UNIQUE INDEX `tickets_ticket_number_key`(`ticket_number`),
    INDEX `tickets_status_priority_created_at_idx`(`status`, `priority`, `created_at`),
    INDEX `tickets_branch_id_status_idx`(`branch_id`, `status`),
    INDEX `tickets_assigned_user_id_status_idx`(`assigned_user_id`, `status`),
    INDEX `tickets_customer_id_idx`(`customer_id`),
    INDEX `tickets_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_messages` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `message_type` ENUM('CUSTOMER', 'AGENT', 'INTERNAL', 'SYSTEM') NOT NULL DEFAULT 'CUSTOMER',
    `body` TEXT NOT NULL,
    `is_internal` BOOLEAN NOT NULL DEFAULT false,
    `author_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_messages_ticket_id_created_at_idx`(`ticket_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_assignments` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `assigned_to_id` CHAR(36) NULL,
    `assigned_user_id` CHAR(36) NULL,
    `assigned_by_id` CHAR(36) NOT NULL,
    `assignment_type` ENUM('ASSIGN', 'REASSIGN', 'AUTO') NOT NULL,
    `reason` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_assignments_ticket_id_created_at_idx`(`ticket_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_escalations` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `from_level` ENUM('L1_SUPPORT', 'L2_SUPPORT', 'SUPPORT_MANAGER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'ADMIN') NOT NULL,
    `to_level` ENUM('L1_SUPPORT', 'L2_SUPPORT', 'SUPPORT_MANAGER', 'BRANCH_MANAGER', 'REGIONAL_MANAGER', 'ADMIN') NOT NULL,
    `escalated_by_id` CHAR(36) NOT NULL,
    `reason` VARCHAR(500) NULL,
    `sla_due_at` DATETIME(3) NULL,
    `escalated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_escalations_ticket_id_escalated_at_idx`(`ticket_id`, `escalated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_resolutions` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `resolved_by_id` CHAR(36) NOT NULL,
    `resolution_notes` TEXT NOT NULL,
    `resolution_type` VARCHAR(50) NULL,
    `resolved_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_resolutions_ticket_id_resolved_at_idx`(`ticket_id`, `resolved_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_attachments` (
    `id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `message_id` CHAR(36) NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `s3_key` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `uploaded_by_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_attachments_ticket_id_idx`(`ticket_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_definitions` (
    `id` CHAR(36) NOT NULL,
    `product_variant_id` CHAR(36) NOT NULL,
    `workflow_code` VARCHAR(32) NOT NULL,
    `version` INTEGER NOT NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `stage_sequence` JSON NOT NULL,
    `approval_gates` JSON NOT NULL,
    `rework_rules` JSON NOT NULL,
    `mandatory_document_codes` JSON NOT NULL,
    `metadata` JSON NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` CHAR(36) NULL,
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,

    INDEX `workflow_definitions_product_variant_id_is_active_idx`(`product_variant_id`, `is_active`),
    UNIQUE INDEX `workflow_definitions_product_variant_id_version_key`(`product_variant_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_stage_configs` (
    `id` CHAR(36) NOT NULL,
    `workflow_definition_id` CHAR(36) NOT NULL,
    `stage_code` ENUM('S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09') NOT NULL,
    `sla_days` INTEGER NULL,
    `sla_business_days_only` BOOLEAN NOT NULL DEFAULT true,
    `mandatory_role_code` VARCHAR(64) NULL,
    `auto_transition_rules` JSON NULL,
    `handler_module` VARCHAR(64) NULL,
    `is_skippable` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workflow_stage_configs_workflow_definition_id_idx`(`workflow_definition_id`),
    UNIQUE INDEX `workflow_stage_configs_workflow_definition_id_stage_code_key`(`workflow_definition_id`, `stage_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_assignment_rules` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `version` INTEGER NOT NULL,
    `branch_id` CHAR(36) NULL,
    `region_id` CHAR(36) NULL,
    `rules` JSON NOT NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `lms_assignment_rules_branch_id_is_active_idx`(`branch_id`, `is_active`),
    INDEX `lms_assignment_rules_region_id_is_active_idx`(`region_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_scoring_config` (
    `id` CHAR(36) NOT NULL,
    `product_family_id` CHAR(36) NULL,
    `version` INTEGER NOT NULL,
    `factor_weights` JSON NOT NULL,
    `grade_thresholds` JSON NOT NULL,
    `ai_weight` DECIMAL(3, 2) NOT NULL DEFAULT 0.30,
    `rule_weight` DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
    `gate_rules` JSON NOT NULL,
    `conversion_probability_defaults` JSON NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `lms_scoring_config_product_family_id_is_active_idx`(`product_family_id`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_sla_rules` (
    `id` CHAR(36) NOT NULL,
    `domain` ENUM('LMS', 'LOS', 'SUPPORT', 'COMMISSION') NOT NULL,
    `sla_name` VARCHAR(128) NOT NULL,
    `sla_code` VARCHAR(64) NOT NULL,
    `target_value` DECIMAL(10, 2) NOT NULL,
    `target_unit` ENUM('MINUTES', 'HOURS', 'DAYS', 'PERCENT') NOT NULL,
    `measurement_formula` TEXT NULL,
    `grade_filter` VARCHAR(8) NULL,
    `stage_code` ENUM('S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09') NULL,
    `workflow_stage_config_id` CHAR(36) NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lms_sla_rules_domain_is_active_idx`(`domain`, `is_active`),
    UNIQUE INDEX `lms_sla_rules_sla_code_effective_from_key`(`sla_code`, `effective_from`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lms_escalation_rules` (
    `id` CHAR(36) NOT NULL,
    `sla_rule_id` CHAR(36) NULL,
    `trigger_event` VARCHAR(64) NOT NULL,
    `trigger_condition` JSON NULL,
    `escalation_level` INTEGER NOT NULL,
    `escalate_to_role` VARCHAR(64) NULL,
    `escalate_to_employee_id` CHAR(36) NULL,
    `notify_channels` JSON NOT NULL,
    `cooldown_minutes` INTEGER NOT NULL DEFAULT 60,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lms_escalation_rules_sla_rule_id_is_active_idx`(`sla_rule_id`, `is_active`),
    INDEX `lms_escalation_rules_trigger_event_is_active_idx`(`trigger_event`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_rule_configs` (
    `id` CHAR(36) NOT NULL,
    `event_code` VARCHAR(64) NOT NULL,
    `channels` JSON NOT NULL,
    `template_codes` JSON NOT NULL,
    `delay_minutes` INTEGER NOT NULL DEFAULT 0,
    `conditions` JSON NULL,
    `audience_type` ENUM('ASSIGNEE', 'ROLE', 'CUSTOMER', 'PARTNER', 'MANAGEMENT') NOT NULL,
    `audience_config` JSON NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `notification_rule_configs_event_code_is_enabled_idx`(`event_code`, `is_enabled`),
    INDEX `notification_rule_configs_effective_from_effective_to_idx`(`effective_from`, `effective_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_rule_configs` (
    `id` CHAR(36) NOT NULL,
    `entity_type` ENUM('APPLICATION', 'COMMISSION', 'WORKFLOW_CONFIG', 'PARTNER') NOT NULL,
    `stage_code` ENUM('S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09') NULL,
    `approval_type` ENUM('SEQUENTIAL', 'PARALLEL', 'ANY_ONE') NOT NULL,
    `required_role_codes` JSON NOT NULL,
    `min_approvers` INTEGER NOT NULL,
    `sod_rules` JSON NULL,
    `escalation_after_hours` INTEGER NULL,
    `amount_thresholds` JSON NULL,
    `version` INTEGER NOT NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` CHAR(36) NULL,

    INDEX `approval_rule_configs_entity_type_stage_code_is_active_idx`(`entity_type`, `stage_code`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    INDEX `system_settings_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_assigned_sales_id_fkey` FOREIGN KEY (`assigned_sales_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_assigned_credit_id_fkey` FOREIGN KEY (`assigned_credit_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_assigned_ops_id_fkey` FOREIGN KEY (`assigned_ops_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_selected_lender_id_fkey` FOREIGN KEY (`selected_lender_id`) REFERENCES `lenders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_status` ADD CONSTRAINT `application_status_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_status` ADD CONSTRAINT `application_status_changed_by_id_fkey` FOREIGN KEY (`changed_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_timeline` ADD CONSTRAINT `application_timeline_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_timeline` ADD CONSTRAINT `application_timeline_performed_by_id_fkey` FOREIGN KEY (`performed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_results` ADD CONSTRAINT `eligibility_results_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_results` ADD CONSTRAINT `eligibility_results_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_results` ADD CONSTRAINT `eligibility_results_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_results` ADD CONSTRAINT `eligibility_results_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_logins` ADD CONSTRAINT `bank_logins_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_logins` ADD CONSTRAINT `bank_logins_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_logins` ADD CONSTRAINT `bank_logins_submitted_by_id_fkey` FOREIGN KEY (`submitted_by_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_reviews` ADD CONSTRAINT `credit_reviews_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_reviews` ADD CONSTRAINT `credit_reviews_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanctions` ADD CONSTRAINT `sanctions_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanctions` ADD CONSTRAINT `sanctions_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanctions` ADD CONSTRAINT `sanctions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursements` ADD CONSTRAINT `disbursements_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursements` ADD CONSTRAINT `disbursements_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disbursements` ADD CONSTRAINT `disbursements_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `closures` ADD CONSTRAINT `closures_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `closures` ADD CONSTRAINT `closures_rm_assigned_id_fkey` FOREIGN KEY (`rm_assigned_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `closures` ADD CONSTRAINT `closures_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_rules` ADD CONSTRAINT `commission_rules_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `commission_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_referral_id_fkey` FOREIGN KEY (`referral_id`) REFERENCES `referrals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_ledger` ADD CONSTRAINT `commission_ledger_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_approvals` ADD CONSTRAINT `commission_approvals_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `commission_ledger`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_approvals` ADD CONSTRAINT `commission_approvals_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_approvals` ADD CONSTRAINT `commission_approvals_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payments` ADD CONSTRAINT `commission_payments_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payments` ADD CONSTRAINT `commission_payments_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payments` ADD CONSTRAINT `commission_payments_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payments` ADD CONSTRAINT `commission_payments_released_by_fkey` FOREIGN KEY (`released_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payments` ADD CONSTRAINT `commission_payments_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payment_items` ADD CONSTRAINT `commission_payment_items_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `commission_payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_payment_items` ADD CONSTRAINT `commission_payment_items_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `commission_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_adjustments` ADD CONSTRAINT `commission_adjustments_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_adjustments` ADD CONSTRAINT `commission_adjustments_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `commission_ledger`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_adjustments` ADD CONSTRAINT `commission_adjustments_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_adjustments` ADD CONSTRAINT `commission_adjustments_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_adjustments` ADD CONSTRAINT `commission_adjustments_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_recoveries` ADD CONSTRAINT `commission_recoveries_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_recoveries` ADD CONSTRAINT `commission_recoveries_ledger_id_fkey` FOREIGN KEY (`ledger_id`) REFERENCES `commission_ledger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_recoveries` ADD CONSTRAINT `commission_recoveries_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_recoveries` ADD CONSTRAINT `commission_recoveries_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_recoveries` ADD CONSTRAINT `commission_recoveries_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_rm_employee_id_fkey` FOREIGN KEY (`rm_employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_profiles` ADD CONSTRAINT `customer_profiles_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_addresses` ADD CONSTRAINT `customer_addresses_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_employment` ADD CONSTRAINT `customer_employment_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_employment` ADD CONSTRAINT `customer_employment_industry_id_fkey` FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_employment` ADD CONSTRAINT `customer_employment_occupation_id_fkey` FOREIGN KEY (`occupation_id`) REFERENCES `occupations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_employment` ADD CONSTRAINT `customer_employment_office_address_id_fkey` FOREIGN KEY (`office_address_id`) REFERENCES `customer_addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_income` ADD CONSTRAINT `customer_income_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_income` ADD CONSTRAINT `customer_income_employment_id_fkey` FOREIGN KEY (`employment_id`) REFERENCES `customer_employment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_preferences` ADD CONSTRAINT `customer_preferences_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_consents` ADD CONSTRAINT `customer_consents_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_document_type_id_fkey` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_verified_by_id_fkey` FOREIGN KEY (`verified_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_document_type_id_fkey` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_requested_by_id_fkey` FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_requests` ADD CONSTRAINT `document_requests_fulfilled_document_id_fkey` FOREIGN KEY (`fulfilled_document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ocr_results` ADD CONSTRAINT `ocr_results_document_version_id_fkey` FOREIGN KEY (`document_version_id`) REFERENCES `document_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_results` ADD CONSTRAINT `verification_results_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_results` ADD CONSTRAINT `verification_results_verified_by_id_fkey` FOREIGN KEY (`verified_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_deficiencies` ADD CONSTRAINT `document_deficiencies_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_deficiencies` ADD CONSTRAINT `document_deficiencies_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_deficiencies` ADD CONSTRAINT `document_deficiencies_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_deficiencies` ADD CONSTRAINT `document_deficiencies_document_request_id_fkey` FOREIGN KEY (`document_request_id`) REFERENCES `document_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_deficiencies` ADD CONSTRAINT `document_deficiencies_raised_by_id_fkey` FOREIGN KEY (`raised_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `presigned_upload_intents` ADD CONSTRAINT `presigned_upload_intents_requested_by_id_fkey` FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_calculations` ADD CONSTRAINT `finance_calculations_computed_by_fkey` FOREIGN KEY (`computed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_verifications` ADD CONSTRAINT `otp_verifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `devices` ADD CONSTRAINT `devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pan_verifications` ADD CONSTRAINT `pan_verifications_kyc_profile_id_fkey` FOREIGN KEY (`kyc_profile_id`) REFERENCES `kyc_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aadhaar_verifications` ADD CONSTRAINT `aadhaar_verifications_kyc_profile_id_fkey` FOREIGN KEY (`kyc_profile_id`) REFERENCES `kyc_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_audit_logs` ADD CONSTRAINT `kyc_audit_logs_kyc_profile_id_fkey` FOREIGN KEY (`kyc_profile_id`) REFERENCES `kyc_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kyc_audit_logs` ADD CONSTRAINT `kyc_audit_logs_performed_by_id_fkey` FOREIGN KEY (`performed_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `lead_sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_scores` ADD CONSTRAINT `lead_scores_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_assignments` ADD CONSTRAINT `lead_assignments_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_status_history` ADD CONSTRAINT `lead_status_history_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_status_history` ADD CONSTRAINT `lead_status_history_changed_by_id_fkey` FOREIGN KEY (`changed_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_performed_by_id_fkey` FOREIGN KEY (`performed_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_notes` ADD CONSTRAINT `lead_notes_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_notes` ADD CONSTRAINT `lead_notes_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_followups` ADD CONSTRAINT `lead_followups_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_followups` ADD CONSTRAINT `lead_followups_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_followups` ADD CONSTRAINT `lead_followups_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `states` ADD CONSTRAINT `states_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cities` ADD CONSTRAINT `cities_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_models` ADD CONSTRAINT `vehicle_models_manufacturer_id_fkey` FOREIGN KEY (`manufacturer_id`) REFERENCES `vehicle_manufacturers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_parent_template_id_fkey` FOREIGN KEY (`parent_template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_templates` ADD CONSTRAINT `notification_templates_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication_logs` ADD CONSTRAINT `communication_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication_logs` ADD CONSTRAINT `communication_logs_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_logs` ADD CONSTRAINT `email_logs_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sms_logs` ADD CONSTRAINT `sms_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sms_logs` ADD CONSTRAINT `sms_logs_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_logs` ADD CONSTRAINT `whatsapp_logs_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whatsapp_logs` ADD CONSTRAINT `whatsapp_logs_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_notifications` ADD CONSTRAINT `push_notifications_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_notifications` ADD CONSTRAINT `push_notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `push_notifications` ADD CONSTRAINT `push_notifications_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_queue` ADD CONSTRAINT `notification_queue_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partners` ADD CONSTRAINT `partners_partner_type_id_fkey` FOREIGN KEY (`partner_type_id`) REFERENCES `partner_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `product_families`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_rules` ADD CONSTRAINT `eligibility_rules_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eligibility_rules` ADD CONSTRAINT `eligibility_rules_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_rules` ADD CONSTRAINT `document_rules_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_rules` ADD CONSTRAINT `document_rules_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_rules` ADD CONSTRAINT `document_rules_document_type_id_fkey` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lender_policies` ADD CONSTRAINT `lender_policies_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lender_policies` ADD CONSTRAINT `lender_policies_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_lender_mappings` ADD CONSTRAINT `product_lender_mappings_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_lender_mappings` ADD CONSTRAINT `product_lender_mappings_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_lender_mappings` ADD CONSTRAINT `product_lender_mappings_lender_id_fkey` FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_lender_mappings` ADD CONSTRAINT `product_lender_mappings_lender_policy_id_fkey` FOREIGN KEY (`lender_policy_id`) REFERENCES `lender_policies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referral_type_id_fkey` FOREIGN KEY (`referral_type_id`) REFERENCES `referral_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_customer_id_fkey` FOREIGN KEY (`referrer_customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_partner_id_fkey` FOREIGN KEY (`referrer_partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_employee_id_fkey` FOREIGN KEY (`referrer_employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `ticket_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_deleted_by_fkey` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_assignments` ADD CONSTRAINT `ticket_assignments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_assignments` ADD CONSTRAINT `ticket_assignments_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_assignments` ADD CONSTRAINT `ticket_assignments_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_assignments` ADD CONSTRAINT `ticket_assignments_assigned_by_id_fkey` FOREIGN KEY (`assigned_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_escalations` ADD CONSTRAINT `ticket_escalations_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_escalations` ADD CONSTRAINT `ticket_escalations_escalated_by_id_fkey` FOREIGN KEY (`escalated_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_resolutions` ADD CONSTRAINT `ticket_resolutions_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_resolutions` ADD CONSTRAINT `ticket_resolutions_resolved_by_id_fkey` FOREIGN KEY (`resolved_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `ticket_attachments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `ticket_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `ticket_messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_attachments` ADD CONSTRAINT `ticket_attachments_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_definitions` ADD CONSTRAINT `workflow_definitions_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_definitions` ADD CONSTRAINT `workflow_definitions_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_definitions` ADD CONSTRAINT `workflow_definitions_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_definitions` ADD CONSTRAINT `workflow_definitions_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_stage_configs` ADD CONSTRAINT `workflow_stage_configs_workflow_definition_id_fkey` FOREIGN KEY (`workflow_definition_id`) REFERENCES `workflow_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_assignment_rules` ADD CONSTRAINT `lms_assignment_rules_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_assignment_rules` ADD CONSTRAINT `lms_assignment_rules_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_assignment_rules` ADD CONSTRAINT `lms_assignment_rules_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_assignment_rules` ADD CONSTRAINT `lms_assignment_rules_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_scoring_config` ADD CONSTRAINT `lms_scoring_config_product_family_id_fkey` FOREIGN KEY (`product_family_id`) REFERENCES `product_families`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_scoring_config` ADD CONSTRAINT `lms_scoring_config_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_scoring_config` ADD CONSTRAINT `lms_scoring_config_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_sla_rules` ADD CONSTRAINT `lms_sla_rules_workflow_stage_config_id_fkey` FOREIGN KEY (`workflow_stage_config_id`) REFERENCES `workflow_stage_configs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_escalation_rules` ADD CONSTRAINT `lms_escalation_rules_sla_rule_id_fkey` FOREIGN KEY (`sla_rule_id`) REFERENCES `lms_sla_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lms_escalation_rules` ADD CONSTRAINT `lms_escalation_rules_escalate_to_employee_id_fkey` FOREIGN KEY (`escalate_to_employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_rule_configs` ADD CONSTRAINT `notification_rule_configs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_rule_configs` ADD CONSTRAINT `notification_rule_configs_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_rule_configs` ADD CONSTRAINT `approval_rule_configs_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approval_rule_configs` ADD CONSTRAINT `approval_rule_configs_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
