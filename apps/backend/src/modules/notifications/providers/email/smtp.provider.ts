import { createConnection } from 'node:net';
import { connect as tlsConnect } from 'node:tls';

import { env } from '../../../../config/env.js';
import type { EmailPayload, EmailProvider, ProviderSendResult } from '../types.js';

function sendSmtpCommand(socket: NodeJS.WritableStream, command: string): void {
  socket.write(`${command}\r\n`);
}

export const smtpProvider: EmailProvider = {
  type: 'SMTP',

  async send(payload: EmailPayload): Promise<ProviderSendResult> {
    const host = env.SMTP_HOST;
    if (!host) {
      return { success: false, error: 'SMTP_HOST not configured' };
    }

    const port = env.SMTP_PORT;
    const secure = env.SMTP_SECURE;
    const from = payload.from ?? env.EMAIL_FROM;

    return new Promise((resolve) => {
      const socket = secure
        ? tlsConnect({ host, port, rejectUnauthorized: false })
        : createConnection({ host, port });

      let step = 0;
      let buffer = '';

      const fail = (error: string) => {
        socket.destroy();
        resolve({ success: false, error });
      };

      const succeed = () => {
        socket.destroy();
        resolve({ success: true, providerRef: `smtp-${Date.now()}`, deliveryStatus: 'accepted' });
      };

      socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const code = Number.parseInt(line.slice(0, 3), 10);
          if (Number.isNaN(code)) continue;

          if (code >= 400) {
            fail(line);
            return;
          }

          if (step === 0 && code === 220) {
            sendSmtpCommand(socket, 'EHLO kuberone.local');
            step = 1;
          } else if (step === 1 && line.startsWith('250')) {
            if (env.SMTP_USER && env.SMTP_PASS) {
              sendSmtpCommand(socket, 'AUTH LOGIN');
              step = 2;
            } else {
              sendSmtpCommand(socket, `MAIL FROM:<${from}>`);
              step = 4;
            }
          } else if (step === 2 && code === 334) {
            sendSmtpCommand(socket, Buffer.from(env.SMTP_USER!).toString('base64'));
            step = 3;
          } else if (step === 3 && code === 334) {
            sendSmtpCommand(socket, Buffer.from(env.SMTP_PASS!).toString('base64'));
            step = 4;
          } else if (step === 4 && code === 235) {
            sendSmtpCommand(socket, `MAIL FROM:<${from}>`);
            step = 5;
          } else if ((step === 4 || step === 5) && code === 250 && line.includes('MAIL FROM')) {
            sendSmtpCommand(socket, `RCPT TO:<${payload.to}>`);
            step = 6;
          } else if (step === 6 && code === 250) {
            sendSmtpCommand(socket, 'DATA');
            step = 7;
          } else if (step === 7 && code === 354) {
            const message = [
              `From: ${from}`,
              `To: ${payload.to}`,
              `Subject: ${payload.subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=utf-8',
              '',
              payload.html ?? payload.body,
              '.',
            ].join('\r\n');
            sendSmtpCommand(socket, message);
            step = 8;
          } else if (step === 8 && code === 250) {
            sendSmtpCommand(socket, 'QUIT');
            succeed();
          }
        }
      });

      socket.on('error', (err) => fail(err.message));
      socket.setTimeout(30_000, () => fail('SMTP timeout'));
    });
  },
};
