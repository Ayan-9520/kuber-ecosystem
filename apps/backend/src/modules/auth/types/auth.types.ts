import type { DataScope, LoginMethod, UserType } from '@kuberone/shared-types';

export interface AuthDeviceInput {
  deviceId: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  fcmToken?: string;
  appVersion?: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface AuthContext {
  userId: string;
  userType: UserType;
  email?: string | null;
  phone?: string | null;
  roles: string[];
  permissions: string[];
  dataScope: DataScope;
  branchId?: string;
  regionId?: string;
  employeeId?: string;
  customerId?: string;
  partnerId?: string;
}

export interface SessionIssueResult {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MeResponse {
  id: string;
  userType: UserType;
  email?: string | null;
  phone?: string | null;
  status: string;
  roles: string[];
  permissions: string[];
  dataScope: DataScope;
  branchId?: string;
  regionId?: string;
  employeeId?: string;
  customerId?: string;
  partnerId?: string;
  lastLoginAt?: Date | null;
}

export interface LoginAuditMeta {
  method: LoginMethod;
  success: boolean;
  failReason?: string;
  sessionId?: string;
}
