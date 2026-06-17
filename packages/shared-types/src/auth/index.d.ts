import type { DataScope, UserType } from '../enums/index.js';
export interface JwtPayload {
    sub: string;
    userType: UserType;
    email?: string;
    phone?: string;
    roles: string[];
    permissions: string[];
    dataScope: DataScope;
    sessionId: string;
    branchId?: string;
    regionId?: string;
    partnerId?: string;
    customerId?: string;
    employeeId?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthenticatedUser extends JwtPayload {
    id: string;
}
//# sourceMappingURL=index.d.ts.map