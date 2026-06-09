export function matchesPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes(required)) return true;

  const base = required.includes(':') ? required.split(':')[0]! : required;
  if (userPermissions.includes(base)) return true;

  const [resourceAction] = required.split(':');
  return userPermissions.some(
    (permission) =>
      permission === required ||
      permission === base ||
      permission.startsWith(`${resourceAction}:`) ||
      permission.endsWith(':all'),
  );
}
