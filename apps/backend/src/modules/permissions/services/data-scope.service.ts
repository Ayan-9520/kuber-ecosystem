import { rbacRepository } from '../../auth/repositories/rbac.repository.js';
import { roleHierarchyService } from '../../roles/services/role-hierarchy.service.js';

export const dataScopeResolutionService = {
  resolveForRoleCode(roleCode: string): string {
    return roleHierarchyService.getHierarchy(roleCode).dataScope ?? 'ASSIGNED';
  },

  async resolveForUserId(userId: string): Promise<string> {
    const assignments = await rbacRepository.getUserRolesWithPermissions(userId);
    const roleCodes = assignments.map((item) => item.role.code);

    if (roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN')) {
      return 'ORGANIZATION';
    }

    const scopes = roleCodes.map((code) => dataScopeResolutionService.resolveForRoleCode(code));
    const rank: Record<string, number> = {
      OWN: 1,
      ASSIGNED: 2,
      BRANCH: 3,
      REGION: 4,
      ORGANIZATION: 5,
    };

    return scopes.sort((a, b) => (rank[b] ?? 0) - (rank[a] ?? 0))[0] ?? 'OWN';
  },
};
