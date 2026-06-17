describe('DSA partner OTP login (Detox)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows DSA login screen', async () => {
    await expect(element(by.text('KuberOne DSA'))).toBeVisible();
  });

  it('completes partner login', async () => {
    await element(by.label('Mobile Number')).typeText('8888777766');
    await element(by.text('Send OTP')).tap();
    await element(by.label('OTP')).typeText('123456');
    await element(by.text('Verify & Sign In')).tap();
    await waitFor(element(by.text('Quick actions')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
