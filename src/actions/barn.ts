'use server'
// Bản quyền thuộc dalymmo.com


import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { CreateBarnInput, UpdateBarnInput, QueryBarnInput, createBarnSchema, updateBarnSchema, queryBarnSchema } from '@/validators/barn'
import { PenWithDetails } from '@/types/barn'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'

/**
 * Lấy danh sách chuồng trại có phân trang và filter
 */
export async function getBarns(params: QueryBarnInput): Promise<ActionResponse<PaginatedResponse<PenWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canRead = hasPermission(user.role, 'barn:view')
    if (!canRead) return { success: false, error: 'Không có quyền truy cập' }

    const validated = queryBarnSchema.parse(params)
    const { page, pageSize, search, type, status, sortBy, sortOrder } = validated

    const skip = (page - 1) * pageSize

    // Xây dựng điều kiện query
    const where: Prisma.PenWhereInput = {
      barn: {
        row: {
          zone: {
            farmId: user.farmId
          }
        }
      },
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(type && { type }),
      ...(status && { status }),
    }

    // Đếm tổng số lượng
    const total = await prisma.pen.count({ where })

    // Truy vấn dữ liệu
    const barns = await prisma.pen.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: {
        _count: {
          select: { pigs: { where: { deletedAt: null } } }
        }
      }
    })

    // Xử lý dữ liệu trả về với các trường tính toán
    const items = barns.map(barn => {
      const currentPigsCount = barn._count.pigs
      const availableCapacity = Math.max(0, barn.capacity - currentPigsCount)
      const utilizationRate = barn.capacity > 0 ? (currentPigsCount / barn.capacity) * 100 : 0

      // Loại bỏ _count
      const { _count, ...barnData } = barn

      return {
        ...barnData,
        currentPigsCount,
        availableCapacity,
        utilizationRate,
      } as PenWithDetails
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
    console.error('Lỗi khi lấy danh sách chuồng:', error)
    return { success: false, error: 'Có lỗi xảy ra khi lấy danh sách chuồng' }
  }
}

/**
 * Thêm mới chuồng
 */
export async function createBarn(data: CreateBarnInput): Promise<ActionResponse<PenWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canCreate = hasPermission(user.role, 'barn:create')
    if (!canCreate) return { success: false, error: 'Không có quyền tạo chuồng' }

    const validated = createBarnSchema.parse(data)

    // Kiểm tra mã chuồng trùng lặp trong cùng một farm
    const existingCode = await prisma.pen.findFirst({
      where: { 
        code: validated.code, 
        deletedAt: null,
        barn: {
          row: {
            zone: {
              farmId: user.farmId
            }
          }
        }
      }
    })

    if (existingCode) {
      return { success: false, error: 'Mã chuồng đã tồn tại' }
    }

    // Sử dụng transaction để tạo chuồng và ghi log
    const barn = await prisma.$transaction(async (tx) => {
      const newBarn = await tx.pen.create({
        data: validated
      })

      await createAuditLogTx(
        tx,
        {
          action: 'CREATE',
          entity: 'PEN',
          entityId: newBarn.id,
          farmId: user.farmId,
          userId: user.id,
          dataAfter: newBarn,
          description: `Tạo chuồng mới: ${newBarn.name} (${newBarn.code})`
        }
      )

      return newBarn
    })

    revalidatePath('/barns')

    return { 
      success: true, 
      data: {
        ...barn,
        currentPigsCount: 0,
        availableCapacity: barn.capacity,
        utilizationRate: 0
      }
    }
  } catch (error) {
    console.error('Lỗi khi tạo chuồng:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return { success: false, error: 'Dữ liệu không hợp lệ' }
    }
    return { success: false, error: 'Có lỗi xảy ra khi tạo chuồng' }
  }
}

/**
 * Xóa chuồng (Soft delete)
 */
export async function deleteBarn(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canDelete = hasPermission(user.role, 'barn:delete')
    if (!canDelete) return { success: false, error: 'Không có quyền xóa chuồng' }

    // Kiểm tra chuồng có tồn tại và thuộc về farm hiện tại
    const barn = await prisma.pen.findUnique({
      where: { id },
      include: {
        barn: {
          include: {
            row: {
              include: { zone: true }
            }
          }
        },
        _count: {
          select: { pigs: { where: { deletedAt: null } } }
        }
      }
    })

    if (!barn || barn.barn.row.zone.farmId !== user.farmId || barn.deletedAt) {
      return { success: false, error: 'Chuồng không tồn tại' }
    }

    // Không cho phép xóa chuồng đang có lợn
    if (barn._count.pigs > 0) {
      return { success: false, error: 'Không thể xóa chuồng đang có lợn' }
    }

    await prisma.$transaction(async (tx) => {
      const deletedBarn = await tx.pen.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          status: 'MAINTENANCE' // Set to maintenance when deleted
        }
      })

      await createAuditLogTx(
        tx,
        {
          action: 'DELETE',
          entity: 'PEN',
          entityId: id,
          farmId: user.farmId,
          userId: user.id,
          dataBefore: barn,
          description: `Xóa chuồng: ${barn.name} (${barn.code})`
        }
      )

      return deletedBarn
    })

    revalidatePath('/barns')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi khi xóa chuồng:', error)
    return { success: false, error: 'Có lỗi xảy ra khi xóa chuồng' }
  }
}

/**
 * Lấy toàn bộ sơ đồ chuồng trại theo phân cấp
 */
export async function getBarnHierarchy() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const hierarchy = await prisma.barnZone.findMany({
      where: { farmId: user.farmId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        rows: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            barns: {
              where: { deletedAt: null },
              orderBy: { sortOrder: 'asc' },
              include: {
                pens: {
                  where: { deletedAt: null },
                  orderBy: { name: 'asc' },
                  include: {
                    pigs: {
                      where: { deletedAt: null, status: { not: 'DEAD' } },
                      select: {
                        id: true,
                        code: true,
                        earTag: true,
                        name: true,
                        status: true,
                        type: true,
                        gender: true,
                      },
                      orderBy: { code: 'asc' },
                    },
                    _count: {
                      select: { pigs: { where: { deletedAt: null } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return { success: true, data: hierarchy }
  } catch (error) {
    console.error('Lỗi khi lấy sơ đồ chuồng:', error)
    return { success: false, error: 'Có lỗi xảy ra khi lấy sơ đồ chuồng' }
  }
}

/**
 * Lấy danh sách lợn chưa được phân ô chuồng (để kéo thả vào sơ đồ)
 */
export async function getUnassignedPigs() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const pigs = await prisma.pig.findMany({
      where: {
        farmId: user.farmId,
        deletedAt: null,
        penId: null,
        status: { notIn: ['DEAD', 'SOLD', 'CULLED'] },
      },
      select: {
        id: true,
        code: true,
        earTag: true,
        name: true,
        status: true,
        type: true,
        gender: true,
      },
      orderBy: { code: 'asc' },
    })

    return { success: true, data: pigs }
  } catch (error) {
    console.error('Lỗi khi lấy lợn chưa phân ô:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy thông tin chuồng theo ID
 */
export async function getBarnById(id: string): Promise<ActionResponse<PenWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const barn = await prisma.pen.findUnique({
      where: { id, deletedAt: null },
      include: {
        barn: {
          include: {
            row: {
              include: { zone: true }
            }
          }
        },
        _count: {
          select: { pigs: { where: { deletedAt: null } } }
        }
      }
    })

    if (!barn || barn.barn.row.zone.farmId !== user.farmId) {
      return { success: false, error: 'Không tìm thấy chuồng' }
    }

    const currentPigsCount = barn._count.pigs
    const availableCapacity = Math.max(0, barn.capacity - currentPigsCount)
    const utilizationRate = barn.capacity > 0 ? (currentPigsCount / barn.capacity) * 100 : 0

    const { _count, ...barnData } = barn

    return { 
      success: true, 
      data: {
        ...barnData,
        currentPigsCount,
        availableCapacity,
        utilizationRate
      } as PenWithDetails
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chuồng:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Cập nhật thông tin chuồng
 */
export async function updateBarn(data: UpdateBarnInput): Promise<ActionResponse<PenWithDetails>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canEdit = hasPermission(user.role, 'barn:edit')
    if (!canEdit) return { success: false, error: 'Không có quyền chỉnh sửa' }

    const validated = updateBarnSchema.parse(data)
    const { id, ...updateData } = validated

    // Kiểm tra chuồng tồn tại
    const existingBarn = await prisma.pen.findUnique({
      where: { id, deletedAt: null },
      include: {
        barn: {
          include: { row: { include: { zone: true } } }
        }
      }
    })

    if (!existingBarn || existingBarn.barn.row.zone.farmId !== user.farmId) {
      return { success: false, error: 'Không tìm thấy chuồng' }
    }

    // Nếu đổi code, kiểm tra trùng lặp
    if (updateData.code !== existingBarn.code) {
      const duplicate = await prisma.pen.findFirst({
        where: {
          code: updateData.code,
          id: { not: id },
          deletedAt: null,
          barn: { row: { zone: { farmId: user.farmId } } }
        }
      })
      if (duplicate) return { success: false, error: 'Mã chuồng đã tồn tại' }
    }

    const updatedBarn = await prisma.$transaction(async (tx) => {
      const barn = await tx.pen.update({
        where: { id },
        data: updateData
      })

      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'PEN',
        entityId: id,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: existingBarn,
        dataAfter: barn,
        description: `Cập nhật thông tin chuồng: ${barn.name}`
      })

      return barn
    })

    revalidatePath('/barns')
    revalidatePath(`/barns/${id}`)

    return { 
      success: true, 
      data: {
        ...updatedBarn,
        currentPigsCount: 0, // Mock, UI will refetch list
        availableCapacity: updatedBarn.capacity,
        utilizationRate: 0
      } as PenWithDetails
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật chuồng:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
