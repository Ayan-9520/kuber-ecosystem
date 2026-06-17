describe('Customer OTP login (Detox)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows login screen', async () => {
    await expect(element(by.text('Welcome to KuberOne'))).toBeVisible();
  });

  it('completes OTP login with demo credentials', async () => {
    await element(by.label('Mobile Number')).typeText('9876543210');
    await element(by.text('Send OTP')).tap();
    await element(by.label('OTP')).typeText('123456');
    await element(by.text('Verify & Sign In')).tap();
    await waitFor(element(by.text('Quick actions')))
      .toBeVisible()
      .withTimeout(15000);
  });
});
