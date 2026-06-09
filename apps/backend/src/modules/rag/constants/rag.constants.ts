export const RAG_MODEL_VERSION = 'rag-v1.0';
export const DEFAULT_VECTOR_INDEX = 'kuberone-main';

export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'text/html': 'HTML',
};

export const SOURCE_TYPE_MAP: Record<string, string> = {
  KNOWLEDGE_ARTICLE: 'KNOWLEDGE_ARTICLE',
  PDF: 'PDF',
  DOCX: 'DOCX',
  TXT: 'TXT',
  MD: 'MD',
  HTML: 'HTML',
  POLICY: 'POLICY',
  FAQ: 'FAQ',
  SOP: 'SOP',
};
