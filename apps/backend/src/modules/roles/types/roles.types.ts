export interface RoleListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  hierarchyLevel?: number;
  dataScope?: string;
  parentRoleCodes?: string[];
  permissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDetail extends RoleListItem {
  permissions: Array<{
    id: string;
    code: string;
    name: string;
    module: string;
  }>;
  effectivePermissions: Array<{
    id: string;
    code: string;
    name: string;
    module: string;
    source: 'direct' | 'inherited';
    inheritedFrom?: string;
  }>;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  actorId: string;
}
