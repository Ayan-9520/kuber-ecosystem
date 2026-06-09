import { notificationTemplateRepository } from '../repositories/notification.repository.js';
import type { RenderedTemplate } from '../types/notifications.types.js';
import { renderTemplateString } from '../utils/notifications.utils.js';

export const templateEngineService = {
  async render(params: {
    templateCode?: string;
    channel: string;
    eventType?: string;
    subject?: string;
    body?: string;
    variables?: Record<string, unknown>;
  }): Promise<RenderedTemplate> {
    let template = params.templateCode
      ? await notificationTemplateRepository.findActiveByCode(params.templateCode, params.channel)
      : null;

    if (!template && params.eventType) {
      template = await notificationTemplateRepository.findActiveByEventAndChannel(params.eventType, params.channel);
    }

    if (template) {
      const vars = params.variables ?? {};
      return {
        subject: template.subject ? renderTemplateString(template.subject, vars) : undefined,
        body: renderTemplateString(template.body, vars),
        templateId: template.id,
        templateCode: template.code,
      };
    }

    const vars = params.variables ?? {};
    return {
      subject: params.subject ? renderTemplateString(params.subject, vars) : undefined,
      body: params.body ? renderTemplateString(params.body, vars) : '',
    };
  },
};
