// Bản quyền thuộc dalymmo.com
'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPermissionMatrix, checkPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/audit'

export async function getRoleMatrix() {
  const user = await getCurrentUser()
  if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập' }
  
  try {
    await checkPermission(user.role as any, 'settings:view', user.farmId)
    const matrix = await getPermissionMatrix(user.farmId)
    return { success: true, data: matrix }
  } catch (err) {
    return { success: false, error: 'Không có quyền' }
  }
}

export async function updateRoleMatrix(matrixStr: string) {
  const user = await getCurrentUser()
  if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập' }
  
  try {
    await checkPermission(user.role as any, 'settings:update', user.farmId)
    
    // Check if it's valid JSON
    JSON.parse(matrixStr)
    
    await prisma.systemParameter.upsert({
      where: {
        farmId_key: {
          farmId: user.farmId,
          key: 'RBAC_MATRIX'
        }
      },
      update: { value: matrixStr },
      create: {
        farmId: user.farmId,
        key: 'RBAC_MATRIX',
        value: matrixStr,
        description: 'Phân quyền Role-based Access Control'
      }
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'SystemParameter',
      entityId: 'RBAC_MATRIX',
      description: 'Cập nhật ma trận phân quyền (RBAC)',
    })

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi hệ thống' }
  }
}
