export enum UserType {
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
  SUSPENDED = 'SUSPENDED',
}

export enum DataScope {
  OWN = 'OWN',
  ASSIGNED = 'ASSIGNED',
  BRANCH = 'BRANCH',
  REGION = 'REGION',
  ORGANIZATION = 'ORGANIZATION',
}

export enum OtpPurpose {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  VERIFY_PHONE = 'VERIFY_PHONE',
  CHANGE_MOBILE = 'CHANGE_MOBILE',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum LoginMethod {
  OTP = 'OTP',
  PASSWORD = 'PASSWORD',
}

export enum LeadGrade {
  A_PLUS = 'A_PLUS',
  A = 'A',
  B = 'B',
  C = 'C',
  REJECTED = 'REJECTED',
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export enum PartnerTypeCode {
  DSA = 'DSA',
  REFERRAL = 'REFERRAL',
  BUILDER = 'BUILDER',
  CA = 'CA',
}

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_REVIEW = 'PENDING_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum ProductCode {
  PL = 'PL',
  HL = 'HL',
  LAP = 'LAP',
  BL = 'BL',
  AL = 'AL',
  CC = 'CC',
}
