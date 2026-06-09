export interface PermissionListItem {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string | null;
  createdAt: Date;
}

export interface PermissionDetail extends PermissionListItem {
  roles: Array<{
    roleId: string;
    roleCode: string;
    roleName: string;
  }>;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  actorId: string;
}
