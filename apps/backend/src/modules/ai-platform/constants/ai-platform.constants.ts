export const AI_PLATFORM_VERSION = 'ai-platform-v1.0';

export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
export const DEFAULT_TRANSCRIPTION_MODEL = 'whisper-1';
export const DEFAULT_TTS_MODEL = 'tts-1';

export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
  'text-embedding-3-small': { input: 0.00002, output: 0 },
  'whisper-1': { input: 0.006, output: 0 },
  'tts-1': { input: 0.015, output: 0 },
};

export const PII_PATTERNS = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
  /\b\d{12}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  /\b\+?91[\s-]?\d{10}\b/g,
];

export const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(everything|all|your)\s+(instructions|rules)/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+(if\s+you\s+are|a)\s+/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /<\s*system\s*>/i,
  /jailbreak/i,
  /do\s+not\s+follow\s+(the\s+)?(rules|policy|guidelines)/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /show\s+(me\s+)?(the\s+)?(system\s+)?prompt/i,
  /override\s+(safety|security|compliance)/i,
  /bypass\s+(rbac|auth|security|kyc|compliance)/i,
  /print\s+(all\s+)?(customer|user|pii)\s+data/i,
  /dump\s+(database|db|table)/i,
];
