import { createNotificationMock, createS3Mock, createStorageMock } from '@kuberone/test-utils';

describe('storage and notification mocks', () => {
  it('uploads and downloads via storage mock', async () => {
    const storage = createStorageMock();
    await storage.upload('docs/pan.pdf', Buffer.from('pdf'));
    const body = await storage.download('docs/pan.pdf');
    expect(body.toString()).toBe('pdf');
  });

  it('S3 mock stores objects', async () => {
    const s3 = createS3Mock();
    await s3.send({ input: { Key: 'k1', Body: Buffer.from('data') } });
    const out = await s3.send({ input: { Key: 'k1' } });
    expect((out as { Body: Buffer }).Body.toString()).toBe('data');
  });

  it('notification mock tracks channels', async () => {
    const notifications = createNotificationMock();
    await notifications.sendEmail({ to: 'a@b.com', subject: 'Hi' });
    await notifications.sendSms({ to: '9876543210', body: 'OTP' });
    expect(notifications.sent).toHaveLength(2);
    expect(notifications.sent[0]!.channel).toBe('email');
  });
});
