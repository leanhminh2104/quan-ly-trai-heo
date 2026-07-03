'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { MatingInput, UltrasoundInput, FarrowingInput, WeaningInput, QueryBreedingInput, matingSchema, ultrasoundSchema, farrowingSchema, weaningSchema, queryBreedingSchema } from '@/validators/breeding'
import { MatingWithDetails } from '@/types/breeding'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'
import { differenceInDays, addDays } from 'date-fns'
import { BREEDING_DEFAULTS } from '@/lib/constants'

/**
 * Lấy danh sách phối giống
 */
export async function getMatings(params: QueryBreedingInput): Promise<ActionResponse<PaginatedResponse<MatingWithDetails>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canRead = hasPermission(user.role, 'breeding:view')
    if (!canRead) return { success: false, error: 'Không có quyền' }

    const validated = queryBreedingSchema.parse(params)
    const { page, pageSize, search, status, result, startDate, endDate, sortBy, sortOrder } = validated

    const skip = (page - 1) * pageSize

    const where: Prisma.MatingWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(status && { status }),
      ...(result && { result }),
      ...(search && {
        sow: {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { earTag: { contains: search, mode: 'insensitive' } }
          ]
        }
      }),
      ...(startDate && endDate && {
        matingDate: {
          gte: startDate,
          lte: endDate
        }
      })
    }

    const total = await prisma.mating.count({ where })

    const matings = await prisma.mating.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { matingDate: 'desc' },
      include: {
        sow: true,
        boar: true,
        farrowing: true
      }
    })

    const items = matings.map(m => {
      return {
        ...m,
        daysSinceMating: differenceInDays(new Date(), m.matingDate)
      } as MatingWithDetails
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
    console.error('Lỗi khi lấy danh sách phối giống:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Tạo phiếu phối giống
 */
export async function createMating(data: MatingInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const canCreate = hasPermission(user.role, 'breeding:create')
    if (!canCreate) return { success: false, error: 'Không có quyền' }

    const validated = matingSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi Mating
      const mating = await tx.mating.create({
        data: {
          farmId: user.farmId,
          ...validated,
          expectedUltrasoundDate: addDays(validated.matingDate, BREEDING_DEFAULTS.ULTRASOUND_DAYS),
          expectedFarrowingDate: addDays(validated.matingDate, BREEDING_DEFAULTS.GESTATION_DAYS),
          expectedMoveToPenDate: addDays(validated.matingDate, BREEDING_DEFAULTS.GESTATION_DAYS - BREEDING_DEFAULTS.MOVE_TO_FARROWING_DAYS_BEFORE),
          createdBy: user.id
        }
      })

      // 2. Cập nhật trạng thái lợn nái
      await tx.pig.update({
        where: { id: validated.sowId },
        data: { status: 'PREGNANT' } // Tạm thời set PREGNANT (hoặc MATED tùy nghiệp vụ)
      })

      // 3. Ghi log sự kiện
      await tx.pigEvent.create({
        data: {
          pigId: validated.sowId,
          eventType: 'MATING',
          eventDate: validated.matingDate,
          title: 'Phối giống',
          description: `Phối giống với ${validated.boarId ? 'đực giống' : 'tinh nhân tạo'}`,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'MATING',
        entityId: mating.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: mating,
        description: `Tạo phiếu phối giống cho nái ID ${validated.sowId}`
      })
    })

    revalidatePath('/breeding/mating')
    revalidatePath('/pigs/sows')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi tạo phối giống:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Cập nhật kết quả siêu âm
 */
export async function updateUltrasound(data: UltrasoundInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = ultrasoundSchema.parse(data)

    const mating = await prisma.mating.findUnique({
      where: { id: validated.matingId }
    })

    if (!mating) return { success: false, error: 'Không tìm thấy phiếu phối' }

    await prisma.$transaction(async (tx) => {
      const isPregnant = validated.ultrasoundResult === 'POSITIVE'
      const status = isPregnant ? 'PREGNANT' : 'NOT_PREGNANT'
      const result = isPregnant ? 'SUCCESS' : 'FAILED'

      await tx.mating.update({
        where: { id: validated.matingId },
        data: {
          ultrasoundDate: validated.ultrasoundDate,
          ultrasoundResult: validated.ultrasoundResult,
          ultrasoundFetusCount: validated.ultrasoundFetusCount,
          isPregnant,
          status,
          result,
          notes: validated.notes
        }
      })

      // Nếu không có thai, chuyển trạng thái lợn nái về ACTIVE để phối lại
      if (!isPregnant) {
        await tx.pig.update({
          where: { id: mating.sowId },
          data: { status: 'ACTIVE' }
        })
      }

      await tx.pigEvent.create({
        data: {
          pigId: mating.sowId,
          eventType: 'PREGNANCY',
          eventDate: validated.ultrasoundDate,
          title: `Siêu âm: ${isPregnant ? 'Đậu thai' : 'Không đậu'}`,
          createdBy: user.id
        }
      })
    })

    revalidatePath('/breeding/pregnancy')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi cập nhật siêu âm:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Báo đẻ
 */
export async function createFarrowing(data: FarrowingInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = farrowingSchema.parse(data)
    
    const mating = await prisma.mating.findUnique({
      where: { id: validated.matingId }
    })

    if (!mating) return { success: false, error: 'Không tìm thấy phiếu phối' }

    await prisma.$transaction(async (tx) => {
      // 1. Tạo record đẻ
      const farrowing = await tx.farrowing.create({
        data: {
          farmId: user.farmId,
          ...validated,
          totalBorn: validated.bornAlive + validated.bornDead + validated.mummified,
          createdBy: user.id
        }
      })

      // 2. Cập nhật trạng thái phiếu phối
      await tx.mating.update({
        where: { id: validated.matingId },
        data: { status: 'FARROWED' }
      })

      // 3. Cập nhật trạng thái nái sang Nuôi con (NURSING)
      await tx.pig.update({
        where: { id: mating.sowId },
        data: { status: 'NURSING' }
      })

      // 4. Log sự kiện
      await tx.pigEvent.create({
        data: {
          pigId: mating.sowId,
          eventType: 'FARROWING',
          eventDate: validated.farrowingDate,
          title: 'Đã đẻ',
          description: `Đẻ ${validated.bornAlive} sống, ${validated.bornDead} chết`,
          createdBy: user.id
        }
      })
    })

    revalidatePath('/breeding/farrowing')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi báo đẻ:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}
