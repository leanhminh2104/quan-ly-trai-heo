'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { CreatePigInput, UpdatePigInput, QueryPigInput, createPigSchema, updatePigSchema, queryPigSchema } from '@/validators/pig'
import { PigWithDetails } from '@/types/pig'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'
import { differenceInDays } from 'date-fns'

/**
 * Lấy danh sách cá thể lợn có phân trang và filter
 */
export async function getPigs(params: QueryPigInput): Promise<ActionResponse<PaginatedResponse<PigWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canRead = hasPermission(user.role, 'pig:view')
    if (!canRead) return { success: false, error: 'Không có quyền truy cập' }

    const validated = queryPigSchema.parse(params)
    const { page, pageSize, search, type, status, gender, penId, breedId, sortBy, sortOrder } = validated

    const skip = (page - 1) * pageSize

    // Xây dựng điều kiện query
    const where: Prisma.PigWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { earTag: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
      ...(gender && { gender }),
      ...(penId && { penId }),
      ...(breedId && { breedId }),
    }

    const total = await prisma.pig.count({ where })

    const pigs = await prisma.pig.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: {
        breed: true,
        pen: {
          include: {
            barn: {
              include: {
                row: {
                  include: { zone: true }
                }
              }
            }
          }
        }
      }
    })

    const items = pigs.map(pig => {
      let ageInDays = 0
      if (pig.birthDate) {
        ageInDays = differenceInDays(new Date(), pig.birthDate)
      } else if (pig.importDate) {
        ageInDays = differenceInDays(new Date(), pig.importDate)
      }

      return {
        ...pig,
        ageInDays
      } as PigWithDetails
    })

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lợn:', error)
    return { success: false, error: 'Có lỗi xảy ra khi lấy danh sách lợn' }
  }
}

/**
 * Lấy chi tiết 1 cá thể lợn
 */
export async function getPigDetails(id: string): Promise<ActionResponse<PigWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const pig = await prisma.pig.findUnique({
      where: { id, farmId: user.farmId, deletedAt: null },
      include: {
        breed: true,
        pen: {
          include: {
            barn: {
              include: {
                row: {
                  include: { zone: true }
                }
              }
            }
          }
        }
      }
    })

    if (!pig) return { success: false, error: 'Không tìm thấy lợn' }

    let ageInDays = 0
    if (pig.birthDate) {
      ageInDays = differenceInDays(new Date(), pig.birthDate)
    } else if (pig.importDate) {
      ageInDays = differenceInDays(new Date(), pig.importDate)
    }

    return { success: true, data: { ...pig, ageInDays } }
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết lợn:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Thêm cá thể mới
 */
export async function createPig(data: CreatePigInput): Promise<ActionResponse<PigWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canCreate = hasPermission(user.role, 'pig:create')
    if (!canCreate) return { success: false, error: 'Không có quyền' }

    const validated = createPigSchema.parse(data)

    const existingCode = await prisma.pig.findFirst({
      where: { code: validated.code, farmId: user.farmId, deletedAt: null }
    })

    if (existingCode) return { success: false, error: 'Mã lợn đã tồn tại' }

    const pig = await prisma.$transaction(async (tx) => {
      const newPig = await tx.pig.create({
        data: {
          ...validated,
          farmId: user.farmId
        }
      })

      // Ghi log sự kiện nhập đàn
      await tx.pigEvent.create({
        data: {
          pigId: newPig.id,
          eventType: 'IMPORT',
          eventDate: newPig.importDate || new Date(),
          title: 'Nhập đàn',
          description: `Nhập đàn lợn mã ${newPig.code}`,
          createdBy: user.id
        }
      })

      // Update pen count if penId is provided
      if (newPig.penId) {
        await tx.pen.update({
          where: { id: newPig.penId },
          data: { currentCount: { increment: 1 }, status: 'OCCUPIED' }
        })
      }

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'PIG',
        entityId: newPig.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: newPig,
        description: `Thêm lợn: ${newPig.code}`
      })

      return newPig
    })

    revalidatePath('/pigs')
    return { success: true, data: pig }
  } catch (error) {
    console.error('Lỗi khi tạo lợn:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Cập nhật cá thể lợn
 */
export async function updatePig(id: string, data: Partial<UpdatePigInput>): Promise<ActionResponse<PigWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canUpdate = hasPermission(user.role, 'pig:update')
    if (!canUpdate) return { success: false, error: 'Không có quyền' }

    const validated = updatePigSchema.partial().parse(data)

    const pig = await prisma.$transaction(async (tx) => {
      const oldPig = await tx.pig.findUnique({ where: { id } })
      if (!oldPig) throw new Error('Không tìm thấy lợn')

      const newPig = await tx.pig.update({
        where: { id },
        data: validated
      })

      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'PIG',
        entityId: newPig.id,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: oldPig,
        dataAfter: newPig,
        description: `Cập nhật lợn: ${oldPig.code}`
      })

      return newPig
    })

    revalidatePath('/pigs')
    revalidatePath(`/pigs/${id}`)
    return { success: true, data: pig as unknown as PigWithDetails }
  } catch (error) {
    console.error('Lỗi khi cập nhật lợn:', error)
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật' }
  }
}

/**
 * Xóa cá thể lợn (Soft delete)
 */
export async function deletePig(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canDelete = hasPermission(user.role, 'pig:delete')
    if (!canDelete) return { success: false, error: 'Không có quyền xóa' }

    const pig = await prisma.pig.findUnique({
      where: { id, farmId: user.farmId, deletedAt: null }
    })

    if (!pig) return { success: false, error: 'Không tồn tại' }

    await prisma.$transaction(async (tx) => {
      await tx.pig.update({
        where: { id },
        data: { deletedAt: new Date() } // Soft delete
      })

      if (pig.penId) {
        await tx.pen.update({
          where: { id: pig.penId },
          data: { currentCount: { decrement: 1 } }
        })
      }

      await tx.pigEvent.create({
        data: {
          pigId: id,
          eventType: 'DEATH',
          eventDate: new Date(),
          title: 'Đã xóa khỏi hệ thống',
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'DELETE',
        entity: 'PIG',
        entityId: id,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: pig,
        description: `Xóa lợn: ${pig.code}`
      })
    })

    revalidatePath('/pigs')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi khi xóa lợn:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
