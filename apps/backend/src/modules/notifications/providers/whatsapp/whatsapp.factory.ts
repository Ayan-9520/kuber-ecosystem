import { env } from '../../../../config/env.js';
import type { WhatsAppProvider } from '../types.js';

import { metaWhatsAppProvider } from './meta-whatsapp.provider.js';
import { mockWhatsAppProvider } from './mock.provider.js';

export function resolveWhatsAppProvider(): WhatsAppProvider {
  if (env.WHATSAPP_BUSINESS_API_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID) return metaWhatsAppProvider;
  return mockWhatsAppProvider;
}
