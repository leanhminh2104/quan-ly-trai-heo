'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { FeedStockInput, MedicineStockInput, QueryInventoryInput, feedStockSchema, medicineStockSchema, queryInventorySchema } from '@/validators/inventory'
import { FeedStockWithDetails, MedicineStockWithDetails } from '@/types/inventory'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'

/**
 * Lấy danh sách lô cám
 */
export async function getFeedStocks(params: QueryInventoryInput): Promise<ActionResponse<PaginatedResponse<FeedStockWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryInventorySchema.parse(params)
    const { page, pageSize, search } = validated
    const skip = (page - 1) * pageSize

    const where: Prisma.FeedStockWhereInput = {
      farmId: user.farmId,
      ...(search && {
        feedType: {
          name: { contains: search, mode: 'insensitive' }
        }
      })
    }

    const total = await prisma.feedStock.count({ where })
    const items = await prisma.feedStock.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { importDate: 'desc' },
      include: { feedType: true }
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
    console.error('Lỗi khi lấy danh sách kho cám:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Nhập kho cám
 */
export async function createFeedStock(data: FeedStockInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = feedStockSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const fs = await tx.feedStock.create({
        data: {
          ...validated,
          remaining: validated.quantity,
          farmId: user.farmId,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'INVENTORY',
        entityId: fs.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: fs,
        description: `Nhập lô cám mới: ${validated.quantity} đơn vị`
      })
    })

    revalidatePath('/inventory/feed')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi nhập kho cám:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy danh sách lô thuốc
 */
export async function getMedicineStocks(params: QueryInventoryInput): Promise<ActionResponse<PaginatedResponse<MedicineStockWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryInventorySchema.parse(params)
    const { page, pageSize, search } = validated
    const skip = (page - 1) * pageSize

    const where: Prisma.MedicineStockWhereInput = {
      farmId: user.farmId,
      ...(search && {
        medicineType: {
          name: { contains: search, mode: 'insensitive' }
        }
      })
    }

    const total = await prisma.medicineStock.count({ where })
    const items = await prisma.medicineStock.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { importDate: 'desc' },
      include: { medicineType: true }
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
    console.error('Lỗi khi lấy danh sách kho thuốc:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Nhập kho thuốc
 */
export async function createMedicineStock(data: MedicineStockInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = medicineStockSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const ms = await tx.medicineStock.create({
        data: {
          ...validated,
          remaining: validated.quantity,
          farmId: user.farmId,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'INVENTORY',
        entityId: ms.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: ms,
        description: `Nhập lô thuốc mới: ${validated.quantity} đơn vị`
      })
    })

    revalidatePath('/inventory/medicine')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi nhập kho thuốc:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
