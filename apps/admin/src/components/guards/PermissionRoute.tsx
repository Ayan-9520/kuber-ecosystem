import { EmptyState } from '@/components/ui';
import { usePermissions } from '@/hooks/usePermissions';

export function PermissionRoute({
  permissions,
  children,
}: {
  permissions?: string[];
  children: React.ReactNode;
}) {
  const { hasPermission, user } = usePermissions();

  if (!user) return null;

  if (permissions?.length && !hasPermission(permissions)) {
    return (
      <div className="page-container" style={{ paddingTop: '3rem' }}>
        <EmptyState
          title="Access denied"
          description="You don't have permission to view this page. Contact your administrator."
        />
      </div>
    );
  }

  return <>{children}</>;
}
