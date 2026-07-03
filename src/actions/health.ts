'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { VaccinationInput, TreatmentInput, QueryHealthInput, vaccinationSchema, treatmentSchema, queryHealthSchema } from '@/validators/health'
import { VaccinationWithDetails, TreatmentWithDetails } from '@/types/health'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'

/**
 * Lấy danh sách tiêm phòng
 */
export async function getVaccinations(params: QueryHealthInput): Promise<ActionResponse<PaginatedResponse<VaccinationWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryHealthSchema.parse(params)
    const { page, pageSize, search, startDate, endDate } = validated

    const skip = (page - 1) * pageSize

    const where: Prisma.VaccinationWhereInput = {
      pig: {
        farmId: user.farmId,
        ...(search && {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { earTag: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      ...(startDate && endDate && {
        vaccinatedAt: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const total = await prisma.vaccination.count({ where })

    const items = await prisma.vaccination.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { vaccinatedAt: 'desc' },
      include: {
        pig: true,
        vaccineType: true
      }
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
    console.error('Lỗi khi lấy danh sách tiêm phòng:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Tạo bản ghi tiêm phòng
 */
export async function createVaccination(data: VaccinationInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = vaccinationSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const v = await tx.vaccination.create({
        data: {
          ...validated,
          createdBy: user.id
        }
      })

      const vType = await tx.vaccineType.findUnique({ where: { id: validated.vaccineTypeId } })

      await tx.pigEvent.create({
        data: {
          pigId: validated.pigId,
          eventType: 'VACCINATION',
          eventDate: validated.vaccinatedAt,
          title: 'Tiêm phòng',
          description: `Tiêm vaccine ${vType?.name || 'không xác định'}`,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'VACCINATION',
        entityId: v.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: v,
        description: `Thêm bản ghi tiêm phòng cho lợn ID ${validated.pigId}`
      })
    })

    revalidatePath('/health/vaccines')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi thêm tiêm phòng:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy danh sách điều trị
 */
export async function getTreatments(params: QueryHealthInput): Promise<ActionResponse<PaginatedResponse<TreatmentWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryHealthSchema.parse(params)
    const { page, pageSize, search, startDate, endDate } = validated

    const skip = (page - 1) * pageSize

    const where: Prisma.TreatmentWhereInput = {
      pig: {
        farmId: user.farmId,
        ...(search && {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { earTag: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      ...(startDate && endDate && {
        treatmentDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const total = await prisma.treatment.count({ where })

    const items = await prisma.treatment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { treatmentDate: 'desc' },
      include: {
        pig: true,
        medicineType: true
      }
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
    console.error('Lỗi khi lấy danh sách điều trị:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Thêm hồ sơ điều trị
 */
export async function createTreatment(data: TreatmentInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = treatmentSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const t = await tx.treatment.create({
        data: {
          ...validated,
          createdBy: user.id
        }
      })

      // Đổi trạng thái lợn thành TREATMENT
      await tx.pig.update({
        where: { id: validated.pigId },
        data: { status: 'TREATMENT' }
      })

      await tx.pigEvent.create({
        data: {
          pigId: validated.pigId,
          eventType: 'TREATMENT',
          eventDate: validated.treatmentDate,
          title: 'Điều trị bệnh',
          description: `Chẩn đoán: ${validated.diagnosis}`,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'TREATMENT',
        entityId: t.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: t,
        description: `Thêm hồ sơ điều trị cho lợn ID ${validated.pigId}`
      })
    })

    revalidatePath('/health/treatments')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi thêm hồ sơ điều trị:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
