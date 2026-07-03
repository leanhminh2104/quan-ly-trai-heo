'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { categorySchema, CategoryInput } from '@/validators/settings'
import { createAuditLog } from '@/lib/audit'
import { checkPermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function getCategories(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const categories = await prisma.category.findMany({
      where: { farmId: user.farmId, deletedAt: null },
      orderBy: [
        { type: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error('Lỗi lấy categories:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function createCategory(data: CategoryInput): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    await checkPermission(user.role, 'settings:categories')

    const validated = categorySchema.parse(data)

    // Check if code exists for same type in the farm
    if (validated.code) {
      const existing = await prisma.category.findFirst({
        where: { farmId: user.farmId, type: validated.type, code: validated.code, deletedAt: null }
      })
      if (existing) return { success: false, error: `Mã danh mục ${validated.code} đã tồn tại trong nhóm này` }
    }

    const category = await prisma.category.create({
      data: {
        ...validated,
        farmId: user.farmId,
      }
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'CREATE',
      entity: 'Category',
      entityId: category.id,
      description: `Tạo danh mục mới: ${category.name} (${category.type})`,
      dataAfter: category,
    })

    revalidatePath('/settings/categories')
    return { success: true, data: category }
  } catch (error: any) {
    console.error('Lỗi tạo danh mục:', error)
    if (error.name === 'ZodError') return { success: false, error: 'Dữ liệu không hợp lệ' }
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function updateCategory(id: string, data: CategoryInput): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    await checkPermission(user.role, 'settings:categories')

    const validated = categorySchema.parse(data)

    const existing = await prisma.category.findFirst({
      where: { id, farmId: user.farmId, deletedAt: null }
    })
    if (!existing) return { success: false, error: 'Không tìm thấy danh mục' }

    if (validated.code && validated.code !== existing.code) {
      const duplicate = await prisma.category.findFirst({
        where: { farmId: user.farmId, type: validated.type, code: validated.code, deletedAt: null }
      })
      if (duplicate) return { success: false, error: `Mã danh mục ${validated.code} đã tồn tại` }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validated,
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Category',
      entityId: category.id,
      description: `Cập nhật danh mục: ${category.name}`,
    })

    revalidatePath('/settings/categories')
    return { success: true, data: category }
  } catch (error: any) {
    console.error('Lỗi cập nhật danh mục:', error)
    if (error.name === 'ZodError') return { success: false, error: 'Dữ liệu không hợp lệ' }
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function toggleCategoryStatus(id: string, isActive: boolean): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    await checkPermission(user.role, 'settings:categories')

    const existing = await prisma.category.findFirst({
      where: { id, farmId: user.farmId, deletedAt: null }
    })
    if (!existing) return { success: false, error: 'Không tìm thấy danh mục' }

    const category = await prisma.category.update({
      where: { id },
      data: { isActive },
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'UPDATE',
      entity: 'Category',
      entityId: category.id,
      description: `${isActive ? 'Mở khóa' : 'Khóa'} danh mục: ${category.name}`,
    })

    revalidatePath('/settings/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Lỗi đổi trạng thái danh mục:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    await checkPermission(user.role, 'settings:categories')

    const existing = await prisma.category.findFirst({
      where: { id, farmId: user.farmId, deletedAt: null }
    })
    if (!existing) return { success: false, error: 'Không tìm thấy danh mục' }

    const category = await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await createAuditLog({
      farmId: user.farmId,
      userId: user.id,
      action: 'DELETE',
      entity: 'Category',
      entityId: category.id,
      description: `Xóa danh mục: ${category.name}`,
    })

    revalidatePath('/settings/categories')
    return { success: true, data: category }
  } catch (error) {
    console.error('Lỗi xóa danh mục:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
