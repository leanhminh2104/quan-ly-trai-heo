'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { farmUpdateSchema, FarmUpdateInput } from '@/validators/settings'
import { createAuditLog } from '@/lib/audit'
import { checkPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function getFarmInfo(): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const farm = await prisma.farm.findUnique({
      where: { id: user.farmId },
    })

    if (!farm) return { success: false, error: 'Không tìm thấy trang trại' }

    return { success: true, data: farm }
  } catch (error) {
    console.error('Lỗi lấy farm info:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function updateFarmInfo(data: FarmUpdateInput): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    // Kiểm tra quyền (chỉ OWNER hoặc MANAGER mới được sửa thông tin trại)
    await checkPermission(user.role, 'farm:update')

    const validated = farmUpdateSchema.parse(data)

    const farm = await prisma.farm.update({
      where: { id: user.farmId },
      data: validated,
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Farm',
      entityId: user.farmId,
      description: 'Cập nhật thông tin trang trại',
    })

    revalidatePath('/settings/farm')

    return { success: true, data: farm }
  } catch (error: any) {
    console.error('Lỗi cập nhật farm info:', error)
    if (error.name === 'ZodError') {
      return { success: false, error: 'Dữ liệu không hợp lệ' }
    }
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
