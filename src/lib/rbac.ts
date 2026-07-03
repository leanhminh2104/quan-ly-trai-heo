// Bản quyền thuộc dalymmo.com
import { UserRole } from '@prisma/client'

/**
 * Permission definition for RBAC
 */
type Permission = string

/**
 * Role hierarchy level - higher number = more permissions
 */
const ROLE_LEVELS: Record<UserRole, number> = {
  OWNER: 5,
  MANAGER: 4,
  VETERINARIAN: 3,
  WORKER: 2,
  VIEWER: 1,
}

/**
 * Permission matrix - defines which roles have which permissions
 */
export const DEFAULT_PERMISSION_MATRIX: Record<Permission, UserRole[]> = {
  // Dashboard
  'dashboard:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER', 'VIEWER'],

  // Barn management
  'barn:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER', 'VIEWER'],
  'barn:create': ['OWNER', 'MANAGER'],
  'barn:update': ['OWNER', 'MANAGER'],
  'barn:delete': ['OWNER', 'MANAGER'],

  // Pig management
  'pig:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER', 'VIEWER'],
  'pig:create': ['OWNER', 'MANAGER'],
  'pig:update': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'pig:delete': ['OWNER', 'MANAGER'],
  'pig:move': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER'],
  'pig:weight': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER'],

  // Breeding
  'breeding:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'VIEWER'],
  'breeding:create': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'breeding:update': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'breeding:delete': ['OWNER', 'MANAGER'],

  // Health
  'health:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'VIEWER'],
  'health:create': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'health:update': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'health:delete': ['OWNER', 'MANAGER'],

  // Inventory
  'inventory:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'VIEWER'],
  'inventory:create': ['OWNER', 'MANAGER'],
  'inventory:update': ['OWNER', 'MANAGER'],
  'inventory:delete': ['OWNER', 'MANAGER'],

  // Finance
  'finance:view': ['OWNER', 'MANAGER'],
  'finance:create': ['OWNER', 'MANAGER'],
  'finance:update': ['OWNER', 'MANAGER'],
  'finance:delete': ['OWNER'],

  // Employees
  'employee:view': ['OWNER', 'MANAGER'],
  'employee:create': ['OWNER', 'MANAGER'],
  'employee:update': ['OWNER', 'MANAGER'],
  'employee:delete': ['OWNER'],

  // Tasks
  'task:view': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER', 'VIEWER'],
  'task:create': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'task:update': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'task:complete': ['OWNER', 'MANAGER', 'VETERINARIAN', 'WORKER'],
  'task:delete': ['OWNER', 'MANAGER'],

  // Reports
  'report:view': ['OWNER', 'MANAGER', 'VETERINARIAN'],
  'report:export': ['OWNER', 'MANAGER'],

  // Audit Log
  'audit:view': ['OWNER', 'MANAGER'],

  // Settings
  'settings:view': ['OWNER', 'MANAGER'],
  'settings:update': ['OWNER'],
  'settings:categories': ['OWNER', 'MANAGER'],
  'settings:parameters': ['OWNER'],

  // Farm management
  'farm:update': ['OWNER'],
  'farm:members': ['OWNER', 'MANAGER'],
}

// Global cache to prevent excessive DB queries during a request
let cachedMatrix: { farmId: string, matrix: Record<Permission, UserRole[]>, timestamp: number } | null = null

export async function getPermissionMatrix(farmId?: string): Promise<Record<Permission, UserRole[]>> {
  if (!farmId) return DEFAULT_PERMISSION_MATRIX
  
  // Use simple cache valid for 5 seconds (mostly for multiple checks within same request flow)
  const now = Date.now()
  if (cachedMatrix && cachedMatrix.farmId === farmId && now - cachedMatrix.timestamp < 5000) {
    return cachedMatrix.matrix
  }

  try {
    const { prisma } = await import('./prisma')
    const param = await prisma.systemParameter.findUnique({
      where: {
        farmId_key: {
          farmId,
          key: 'RBAC_MATRIX'
        }
      }
    })

    if (param && param.value) {
      const parsed = JSON.parse(param.value)
      cachedMatrix = { farmId, matrix: parsed, timestamp: now }
      return parsed
    }
  } catch (error) {
    console.error('Error fetching custom RBAC matrix:', error)
  }

  cachedMatrix = { farmId, matrix: DEFAULT_PERMISSION_MATRIX, timestamp: now }
  return DEFAULT_PERMISSION_MATRIX
}

export async function hasPermissionAsync(role: UserRole, permission: Permission, farmId?: string): Promise<boolean> {
  const matrix = await getPermissionMatrix(farmId)
  const allowedRoles = matrix[permission]
  if (!allowedRoles) return false
  return allowedRoles.includes(role)
}

/**
 * @deprecated Use hasPermissionAsync instead. This function only uses default matrix.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = DEFAULT_PERMISSION_MATRIX[permission]
  if (!allowedRoles) return false
  return allowedRoles.includes(role)
}

export async function checkPermission(
  role: UserRole | undefined,
  permission: Permission,
  farmId?: string
): Promise<void> {
  if (!role) {
    throw new Error('Bạn chưa đăng nhập')
  }
  const allowed = await hasPermissionAsync(role, permission, farmId)
  if (!allowed) {
    throw new Error('Bạn không có quyền thực hiện thao tác này')
  }
}

export async function getRolePermissionsAsync(role: UserRole, farmId?: string): Promise<Permission[]> {
  const matrix = await getPermissionMatrix(farmId)
  return Object.entries(matrix)
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission)
}

export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVELS[role]
}

export function isRoleHigherOrEqual(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_LEVELS[roleA] >= ROLE_LEVELS[roleB]
}

