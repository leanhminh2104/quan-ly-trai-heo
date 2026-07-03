'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { queryAuditLogSchema, QueryAuditLogInput } from '@/validators/audit-log'
import { Prisma } from '@prisma/client'

export async function getAuditLogs(params: QueryAuditLogInput): Promise<ActionResponse<PaginatedResponse<any>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryAuditLogSchema.parse(params)
    const { page, pageSize, action, entity, userId, startDate, endDate } = validated

    const where: Prisma.AuditLogWhereInput = {
      farmId: user.farmId,
    }

    if (action) where.action = action
    if (entity && entity !== 'ALL') where.entity = entity
    if (userId && userId !== 'ALL') where.userId = userId

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
    ])

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('Lỗi lấy danh sách Audit Log:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function getAuditEntities(): Promise<ActionResponse<string[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const entities = await prisma.auditLog.findMany({
      where: { farmId: user.farmId },
      select: { entity: true },
      distinct: ['entity'],
      orderBy: { entity: 'asc' }
    })

    return {
      success: true,
      data: entities.map(e => e.entity)
    }
  } catch (error) {
    console.error('Lỗi lấy danh sách Entities:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
