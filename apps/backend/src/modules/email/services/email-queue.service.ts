import type { Prisma } from '@kuberone/database';
import type { ListEmailQueueQuery } from '@kuberone/shared-validation';

import { EMAIL_RETRY_DELAY_MS } from '../constants/email.constants.js';
import { emailQueueRepository } from '../repositories/email.repository.js';
import { buildPaginationMeta } from '../utils/email.utils.js';

import { emailOrchestratorService } from './email-orchestrator.service.js';

export const emailQueueService = {
  async list(query: ListEmailQueueQuery) {
    const where: Prisma.EmailQueueWhereInput = {
      ...(query.status ? { status: query.status as never } : {}),
      ...(query.queueType ? { queueType: query.queueType as never } : {}),
      ...(query.priority ? { priority: query.priority as never } : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      emailQueueRepository.list(where, skip, query.limit),
      emailQueueRepository.count(where),
    ]);
    return { items, meta: buildPaginationMeta(query.page, query.limit, total) };
  },

  async processBatch(limit = 20) {
    const items = await emailQueueRepository.listPending(limit);
    const results: Array<{ id: string; success: boolean }> = [];

    for (const item of items) {
      await emailQueueRepository.update(item.id, { status: 'PROCESSING' });
      try {
        const variables = (item.variables as Record<string, unknown>) ?? undefined;
        const otpValue = variables?.otp != null ? String(variables.otp) : '';
        const blankQueuedBody =
          /OTP is\s*\./i.test(item.textBody ?? '') ||
          /password is:\s*<\/p>/i.test(item.htmlBody ?? '') ||
          /password is:\s*$/im.test(item.htmlBody ?? '');

        // Recover blank OTP retries: rebuild body from variables.otp
        if (otpValue && blankQueuedBody) {
          const expiryMinutes = Number(variables?.expiryMinutes ?? variables?.expiryMinute ?? 5);
          await emailOrchestratorService.dispatchNow({
            toEmail: item.toEmail,
            userId: item.recipientUserId ?? undefined,
            eventType: 'PARTNER_LOGIN_OTP',
            subject: 'KuberOne Partner Login OTP',
            htmlBody: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#E8F4F2"><h2 style="color:#22D3A6;margin:0 0 12px">KuberOne Partner Login</h2><p>Your one-time password (OTP) is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:16px 0;color:#FFFFFF">${otpValue}</p><p>This code expires in ${expiryMinutes} minute(s). Do not share it with anyone.</p></div>`,
            textBody: `Your KuberOne Partner OTP is ${otpValue}. Valid for ${expiryMinutes} minute(s). Do not share this code.`,
            variables,
            priority: item.priority,
          });
        } else {
          await emailOrchestratorService.dispatchNow({
            toEmail: item.toEmail,
            userId: item.recipientUserId ?? undefined,
            templateCode: item.templateCode ?? undefined,
            subject: item.subject ?? undefined,
            htmlBody: item.htmlBody ?? undefined,
            textBody: item.textBody ?? undefined,
            variables,
            priority: item.priority,
          });
        }
        await emailQueueRepository.update(item.id, { status: 'COMPLETED', processedAt: new Date() });
        results.push({ id: item.id, success: true });
      } catch (error) {
        const retryCount = item.retryCount + 1;
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (retryCount >= item.maxRetries) {
          await emailQueueRepository.update(item.id, {
            status: 'FAILED',
            queueType: 'FAILED',
            retryCount,
            lastError: message,
          });
        } else {
          await emailQueueRepository.update(item.id, {
            status: 'PENDING',
            queueType: 'RETRY',
            retryCount,
            lastError: message,
            scheduledAt: new Date(Date.now() + EMAIL_RETRY_DELAY_MS * retryCount),
          });
        }
        results.push({ id: item.id, success: false });
      }
    }

    return results;
  },
};
