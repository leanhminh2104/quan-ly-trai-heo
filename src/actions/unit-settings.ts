'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { unitSchema, UnitInput } from '@/validators/settings'
import { createAuditLog } from '@/lib/audit'
import { checkPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function getUnits(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    const units = await prisma.unit.findMany({
      where: { farmId: user.farmId },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: units }
  } catch (error) {
    console.error('Lỗi lấy units:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function createUnit(data: UnitInput): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    await checkPermission(user.role, 'settings:categories')

    const validated = unitSchema.parse(data)

    const existing = await prisma.unit.findFirst({
      where: { farmId: user.farmId, code: validated.code }
    })
    if (existing) return { success: false, error: `Mã đơn vị ${validated.code} đã tồn tại` }

    const unit = await prisma.unit.create({
      data: {
        ...validated,
        farmId: user.farmId,
      }
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'CREATE',
      entity: 'Unit',
      entityId: unit.id,
      description: `Tạo đơn vị tính mới: ${unit.name}`,
      dataAfter: unit,
    })

    revalidatePath('/settings/units')
    return { success: true, data: unit }
  } catch (error: any) {
    console.error('Lỗi tạo đơn vị:', error)
    if (error.name === 'ZodError') return { success: false, error: 'Dữ liệu không hợp lệ' }
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function updateUnit(id: string, data: UnitInput): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    await checkPermission(user.role, 'settings:categories')

    const validated = unitSchema.parse(data)

    const existing = await prisma.unit.findFirst({
      where: { id, farmId: user.farmId }
    })
    if (!existing) return { success: false, error: 'Không tìm thấy đơn vị tính' }

    if (validated.code !== existing.code) {
      const duplicate = await prisma.unit.findFirst({
        where: { farmId: user.farmId, code: validated.code }
      })
      if (duplicate) return { success: false, error: `Mã đơn vị ${validated.code} đã tồn tại` }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: validated,
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Unit',
      entityId: unit.id,
      description: `Cập nhật đơn vị tính: ${unit.name}`,
    })

    revalidatePath('/settings/units')
    return { success: true, data: unit }
  } catch (error: any) {
    console.error('Lỗi cập nhật đơn vị:', error)
    if (error.name === 'ZodError') return { success: false, error: 'Dữ liệu không hợp lệ' }
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function toggleUnitStatus(id: string, isActive: boolean): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    await checkPermission(user.role, 'settings:categories')

    const existing = await prisma.unit.findFirst({
      where: { id, farmId: user.farmId }
    })
    if (!existing) return { success: false, error: 'Không tìm thấy đơn vị tính' }

    const unit = await prisma.unit.update({
      where: { id },
      data: { isActive },
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Unit',
      entityId: unit.id,
      description: `${isActive ? 'Mở khóa' : 'Khóa'} đơn vị tính: ${unit.name}`,
    })

    revalidatePath('/settings/units')
    return { success: true, data: unit }
  } catch (error) {
    console.error('Lỗi đổi trạng thái đơn vị:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
