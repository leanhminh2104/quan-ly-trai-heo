'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { CreateEmployeeInput, UpdateEmployeeInput, QueryEmployeeInput, createEmployeeSchema, updateEmployeeSchema, queryEmployeeSchema } from '@/validators/employee'
import { EmployeeWithDetails } from '@/types/employee'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'

/**
 * Lấy danh sách nhân viên có phân trang
 */
export async function getEmployees(params: QueryEmployeeInput): Promise<ActionResponse<PaginatedResponse<EmployeeWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    // Kiểm tra quyền view (tạm dùng quyền view chung hoặc role MANAGER/OWNER)
    // Tạm thời cho MANAGER và OWNER view all, hoặc có thể custom hasPermission
    if (!hasPermission(user.role, 'employee:view')) {
      return { success: false, error: 'Không có quyền truy cập' }
    }

    const validated = queryEmployeeSchema.parse(params)
    const { page, pageSize, search, department, role, isActive, sortBy, sortOrder } = validated

    const skip = (page - 1) * pageSize

    const where: Prisma.EmployeeWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(department && { department }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    }

    const total = await prisma.employee.count({ where })

    const items = await prisma.employee.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
    })

    // Fetch assigned zones if needed
    const zoneIds = items.map(i => i.assignedZoneId).filter(Boolean) as string[]
    let zones: Record<string, string> = {}
    if (zoneIds.length > 0) {
      const dbZones = await prisma.barnZone.findMany({
        where: { id: { in: zoneIds } },
        select: { id: true, name: true }
      })
      zones = dbZones.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {})
    }

    const itemsWithDetails = items.map(item => ({
      ...item,
      assignedZoneName: item.assignedZoneId ? zones[item.assignedZoneId] : null
    }))

    return {
      success: true,
      data: {
        items: itemsWithDetails,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error)
    return { success: false, error: 'Có lỗi xảy ra khi lấy dữ liệu' }
  }
}

/**
 * Thêm nhân viên mới
 */
export async function createEmployee(data: CreateEmployeeInput): Promise<ActionResponse<EmployeeWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return { success: false, error: 'Không có quyền tạo nhân viên' }
    }

    const validated = createEmployeeSchema.parse(data)

    const employee = await prisma.$transaction(async (tx) => {
      const newEmployee = await tx.employee.create({
        data: {
          ...validated,
          farmId: user.farmId,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'EMPLOYEE',
        entityId: newEmployee.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: newEmployee,
        description: `Thêm nhân viên: ${newEmployee.name}`
      })

      return newEmployee
    })

    revalidatePath('/employees')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Cập nhật nhân viên
 */
export async function updateEmployee(data: UpdateEmployeeInput): Promise<ActionResponse<EmployeeWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return { success: false, error: 'Không có quyền cập nhật nhân viên' }
    }

    const validated = updateEmployeeSchema.parse(data)
    const { id, ...updateData } = validated

    const existing = await prisma.employee.findUnique({
      where: { id, farmId: user.farmId, deletedAt: null }
    })

    if (!existing) return { success: false, error: 'Không tìm thấy nhân viên' }

    const employee = await prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id },
        data: updateData
      })

      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'EMPLOYEE',
        entityId: id,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: existing,
        dataAfter: updated,
        description: `Cập nhật nhân viên: ${updated.name}`
      })

      return updated
    })

    revalidatePath('/employees')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Xóa nhân viên (Soft delete)
 */
export async function deleteEmployee(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    if (user.role !== 'OWNER' && user.role !== 'MANAGER') {
      return { success: false, error: 'Không có quyền xóa nhân viên' }
    }

    const existing = await prisma.employee.findUnique({
      where: { id, farmId: user.farmId, deletedAt: null }
    })

    if (!existing) return { success: false, error: 'Không tìm thấy nhân viên' }

    await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          isActive: false
        }
      })

      await createAuditLogTx(tx, {
        action: 'DELETE',
        entity: 'EMPLOYEE',
        entityId: id,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: existing,
        description: `Xóa nhân viên: ${existing.name}`
      })
    })

    revalidatePath('/employees')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
