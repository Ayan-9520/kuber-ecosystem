import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'testing', 'uat', 'production', 'test'])
    .default('development'),
  APP_ENV: z.enum(['development', 'testing', 'uat', 'production']).default('development'),
});

export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith('mysql://')),
  /** Prisma connection pool size per process (append to URL if not set). */
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
});

export const jwtEnvSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
});

export const awsEnvSchema = z.object({
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

export const openaiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_DEFAULT_MODEL: z.string().optional(),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  OPENAI_TRANSCRIPTION_MODEL: z.string().default('whisper-1'),
  OPENAI_TTS_MODEL: z.string().default('tts-1'),
  OPENAI_TTS_VOICE: z.string().default('alloy'),
  OPENAI_MAX_TOKENS: z.coerce.number().default(1200),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.35),
  OPENAI_FALLBACK_MODEL: z.string().default('gpt-4o-mini'),
});

export const ragEnvSchema = z.object({
  EMBEDDING_PROVIDER: z.enum(['openai', 'local_hash']).default('local_hash'),
  VECTOR_DB_PROVIDER: z.enum(['local', 'pgvector', 'qdrant', 'pinecone', 'weaviate']).default('local'), // production: use 'local' (MySQL-backed)
  VECTOR_DB_URL: z.string().optional(),
  VECTOR_DB_API_KEY: z.string().optional(),
  RAG_CHUNK_SIZE: z.coerce.number().default(800),
  RAG_CHUNK_OVERLAP: z.coerce.number().default(100),
  RAG_TOP_K: z.coerce.number().default(5),
  RAG_MIN_SCORE: z.coerce.number().default(0.3),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type JwtEnv = z.infer<typeof jwtEnvSchema>;
export type AwsEnv = z.infer<typeof awsEnvSchema>;
export type OpenaiEnv = z.infer<typeof openaiEnvSchema>;
export type RagEnv = z.infer<typeof ragEnvSchema>;

export const redisEnvSchema = z.object({
  REDIS_URL: z.string().url().or(z.string().startsWith('redis://')).optional(),
});

export type RedisEnv = z.infer<typeof redisEnvSchema>;

export const communicationEnvSchema = z.object({
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'aws_ses', 'mock']).default('mock'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SENDGRID_API_KEY: z.string().optional(),
  AWS_SES_REGION: z.string().default('ap-south-1'),
  AWS_SES_ACCESS_KEY: z.string().optional(),
  AWS_SES_SECRET_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@kuberfinserve.com'),
  EMAIL_FROM_NAME: z.string().default('Kuber Finserve'),
  EMAIL_WORKER_ENABLED: z.coerce.boolean().default(true),
  EMAIL_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
  EMAIL_WORKER_BATCH_SIZE: z.coerce.number().default(20),
  EMAIL_MAX_ATTACHMENT_BYTES: z.coerce.number().default(5_242_880),
  SMS_PROVIDER: z.enum(['msg91', 'twilio', 'aws_sns', 'mock']).default('mock'),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_TEMPLATE_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().default('KUBERF'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  AWS_SNS_REGION: z.string().default('ap-south-1'),
  AWS_SNS_ACCESS_KEY: z.string().optional(),
  AWS_SNS_SECRET_KEY: z.string().optional(),
  SMS_WORKER_ENABLED: z.coerce.boolean().default(true),
  SMS_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
  SMS_WORKER_BATCH_SIZE: z.coerce.number().default(25),
  SMS_OTP_RATE_LIMIT_PER_PHONE: z.coerce.number().default(5),
  SMS_OTP_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(3_600_000),
  WHATSAPP_BUSINESS_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default('v21.0'),
  PUSH_PROVIDER: z.enum(['fcm', 'onesignal', 'azure', 'mock']).default('mock'),
  FCM_SERVER_KEY: z.string().optional(),
  FCM_PROJECT_ID: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_WEB_API_KEY: z.string().optional(),
  FCM_SENDER_ID: z.string().optional(),
  FCM_APP_ID: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  PUSH_WORKER_ENABLED: z.coerce.boolean().default(true),
  PUSH_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
  PUSH_WORKER_BATCH_SIZE: z.coerce.number().default(25),
  NOTIFICATION_WORKER_ENABLED: z.coerce.boolean().default(true),
  NOTIFICATION_WORKER_INTERVAL_MS: z.coerce.number().default(15_000),
  NOTIFICATION_WORKER_BATCH_SIZE: z.coerce.number().default(25),
  NOTIFICATION_EMAIL_ENABLED: z.coerce.boolean().default(true),
  NOTIFICATION_SMS_ENABLED: z.coerce.boolean().default(true),
  NOTIFICATION_WHATSAPP_ENABLED: z.coerce.boolean().default(true),
  NOTIFICATION_PUSH_ENABLED: z.coerce.boolean().default(true),
  WEBHOOK_SECRET: z.string().optional(),
  ANALYTICS_WORKER_ENABLED: z.coerce.boolean().default(true),
  ANALYTICS_WORKER_INTERVAL_MS: z.coerce.number().default(300_000),
  ANALYTICS_CACHE_TTL_MS: z.coerce.number().default(60_000),
  EXECUTIVE_ANALYTICS_WORKER_ENABLED: z.coerce.boolean().default(true),
  EXECUTIVE_ANALYTICS_WORKER_INTERVAL_MS: z.coerce.number().default(300_000),
  BRANCH_ANALYTICS_WORKER_ENABLED: z.coerce.boolean().default(true),
  BRANCH_ANALYTICS_WORKER_INTERVAL_MS: z.coerce.number().default(300_000),
  REGIONAL_ANALYTICS_WORKER_ENABLED: z.coerce.boolean().default(true),
  REGIONAL_ANALYTICS_WORKER_INTERVAL_MS: z.coerce.number().default(300_000),
  AUTOMATION_WORKER_ENABLED: z.coerce.boolean().default(true),
  AUTOMATION_WORKER_INTERVAL_MS: z.coerce.number().default(10_000),
  AUTOMATION_WORKER_BATCH_SIZE: z.coerce.number().default(25),
  AUTOMATION_MAX_RETRIES: z.coerce.number().default(3),
  /** When false, API process skips background workers (use dedicated worker instances in production). */
  API_WORKERS_ENABLED: z.coerce.boolean().default(true),
  LEAD_EXPORT_MAX_ROWS: z.coerce.number().default(5000),
});

export type CommunicationEnv = z.infer<typeof communicationEnvSchema>;
