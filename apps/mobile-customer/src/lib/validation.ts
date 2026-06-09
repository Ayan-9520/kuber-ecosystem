export function validateIndianMobile(phone: string): string | null {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]/.test(digits)) return 'Mobile number must start with 6–9';
  return null;
}

export function validateOtp(otp: string): string | null {
  if (!/^\d{6}$/.test(otp)) return 'Enter the 6-digit OTP';
  return null;
}
