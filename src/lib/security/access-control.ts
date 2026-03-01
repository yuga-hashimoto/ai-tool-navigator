/**
 * Access Control (RBAC)
 * Manages user roles and permissions.
 */

export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'SECURITY_OFFICER' | 'OWNER';

export interface Permission {
  action: string;
  resource: string;
}

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  USER: ['read:tools', 'read:blog'],
  MODERATOR: ['read:tools', 'read:blog', 'manage:comments'],
  ADMIN: ['read:all', 'manage:all', 'view:admin-dashboard'],
  SECURITY_OFFICER: ['read:all', 'manage:security', 'view:admin-dashboard', 'view:security-dashboard'],
  OWNER: ['*'],
};

/**
 * Check if a user with a given role has a specific permission
 */
export const hasPermission = (role: Role, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];

  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;

  // Support wildcard permissions like 'read:*'
  const [action, resource] = permission.split(':');
  if (permissions.includes(`${action}:*`)) return true;
  if (permissions.includes(`*:${resource}`)) return true;

  return false;
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: Role): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if a role is higher than another role
 */
export const isRoleHigher = (role: Role, otherRole: Role): boolean => {
  const hierarchy: Role[] = ['USER', 'MODERATOR', 'ADMIN', 'SECURITY_OFFICER', 'OWNER'];
  return hierarchy.indexOf(role) > hierarchy.indexOf(otherRole);
};
