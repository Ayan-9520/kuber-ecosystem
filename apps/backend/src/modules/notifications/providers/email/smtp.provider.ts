import { createConnection, type Socket } from 'node:net';
import { connect as tlsConnect, type TLSSocket } from 'node:tls';

import { env } from '../../../../config/env.js';
import type { EmailPayload, EmailProvider, ProviderSendResult } from '../types.js';

type SmtpSocket = Socket | TLSSocket;

function sendSmtpCommand(socket: NodeJS.WritableStream, command: string): void {
  socket.write(`${command}\r\n`);
}

function isFinalReply(line: string): boolean {
  return line.length >= 4 && line[3] === ' ';
}

/**
 * Hostinger: 587 = plain + STARTTLS, 465 = implicit TLS.
 * Do not use implicit TLS on 587 (causes ssl wrong version number).
 */
export const smtpProvider: EmailProvider = {
  type: 'SMTP',

  async send(payload: EmailPayload): Promise<ProviderSendResult> {
    const host = env.SMTP_HOST;
    if (!host) {
      return { success: false, error: 'SMTP_HOST not configured' };
    }

    const port = env.SMTP_PORT || 587;
    // Hostinger: 465 = implicit TLS, 587 = STARTTLS.
    // Ignore SMTP_SECURE env — z.coerce.boolean turns string "false" into true.
    const useImplicitTls = port === 465;
    const useStartTls = port !== 465;
    const from = payload.from ?? env.EMAIL_FROM;
    const smtpUser = env.SMTP_USER;
    const smtpPass = env.SMTP_PASS ?? env.SMTP_PASSWORD;

    return new Promise((resolve) => {
      let socket: SmtpSocket = useImplicitTls
        ? tlsConnect({ host, port, servername: host, rejectUnauthorized: false })
        : createConnection({ host, port });

      let step:
        | 'greeting'
        | 'ehlo1'
        | 'starttls'
        | 'ehlo2'
        | 'auth'
        | 'user'
        | 'pass'
        | 'mail'
        | 'rcpt'
        | 'data'
        | 'body'
        | 'quit' = 'greeting';
      let buffer = '';
      let settled = false;

      const finish = (result: ProviderSendResult) => {
        if (settled) return;
        settled = true;
        try {
          socket.destroy();
        } catch {
          /* ignore */
        }
        resolve(result);
      };

      const fail = (error: string) => finish({ success: false, error });
      const succeed = () =>
        finish({ success: true, providerRef: `smtp-${Date.now()}`, deliveryStatus: 'accepted' });

      const upgradeToTls = (): Promise<void> =>
        new Promise((upgradeResolve, upgradeReject) => {
          const plain = socket as Socket;
          const tlsSocket = tlsConnect(
            { socket: plain, host, servername: host, rejectUnauthorized: false },
            () => {
              socket = tlsSocket;
              attachDataHandler();
              upgradeResolve();
            },
          );
          tlsSocket.on('error', upgradeReject);
        });

      const handleLine = async (line: string) => {
        if (!line) return;
        const code = Number.parseInt(line.slice(0, 3), 10);
        if (Number.isNaN(code)) return;
        if (!isFinalReply(line) && step !== 'ehlo1' && step !== 'ehlo2') return;

        if (code >= 400) {
          fail(line);
          return;
        }

        try {
          if (step === 'greeting' && code === 220) {
            sendSmtpCommand(socket, 'EHLO kuberone.local');
            step = 'ehlo1';
            return;
          }

          if ((step === 'ehlo1' || step === 'ehlo2') && code === 250 && isFinalReply(line)) {
            if (step === 'ehlo1' && useStartTls) {
              sendSmtpCommand(socket, 'STARTTLS');
              step = 'starttls';
              return;
            }

            if (smtpUser && smtpPass) {
              sendSmtpCommand(socket, 'AUTH LOGIN');
              step = 'auth';
            } else {
              sendSmtpCommand(socket, `MAIL FROM:<${from}>`);
              step = 'mail';
            }
            return;
          }

          if (step === 'starttls' && code === 220) {
            await upgradeToTls();
            sendSmtpCommand(socket, 'EHLO kuberone.local');
            step = 'ehlo2';
            return;
          }

          if (step === 'auth' && code === 334) {
            sendSmtpCommand(socket, Buffer.from(smtpUser!).toString('base64'));
            step = 'user';
            return;
          }

          if (step === 'user' && code === 334) {
            sendSmtpCommand(socket, Buffer.from(smtpPass!).toString('base64'));
            step = 'pass';
            return;
          }

          if (step === 'pass' && code === 235) {
            sendSmtpCommand(socket, `MAIL FROM:<${from}>`);
            step = 'mail';
            return;
          }

          if (step === 'mail' && code === 250) {
            sendSmtpCommand(socket, `RCPT TO:<${payload.to}>`);
            step = 'rcpt';
            return;
          }

          if (step === 'rcpt' && code === 250) {
            sendSmtpCommand(socket, 'DATA');
            step = 'data';
            return;
          }

          if (step === 'data' && code === 354) {
            const html = payload.html ?? payload.body ?? '';
            const message = [
              `From: ${from}`,
              `To: ${payload.to}`,
              `Subject: ${payload.subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/html; charset=utf-8',
              '',
              html,
              '.',
            ].join('\r\n');
            sendSmtpCommand(socket, message);
            step = 'body';
            return;
          }

          if (step === 'body' && code === 250) {
            sendSmtpCommand(socket, 'QUIT');
            step = 'quit';
            succeed();
          }
        } catch (err) {
          fail(err instanceof Error ? err.message : String(err));
        }
      };

      const onData = (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          const line = raw.replace(/\r$/, '');
          void handleLine(line);
        }
      };

      const attachDataHandler = () => {
        socket.removeAllListeners('data');
        socket.on('data', onData);
      };

      attachDataHandler();
      socket.on('error', (err) => fail(err.message));
      socket.setTimeout(30_000, () => fail('SMTP timeout'));
    });
  },
};
