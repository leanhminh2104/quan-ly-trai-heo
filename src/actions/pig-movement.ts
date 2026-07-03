'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createAuditLogTx } from '@/lib/audit'
import { ActionResponse } from '@/types/common'

interface MovePigInput {
  pigId: string
  toPenId: string
  reason?: string
}

/**
 * Chuyển lợn từ ô chuồng này sang ô chuồng khác.
 * Tạo bản ghi PigMovement, cập nhật currentCount của cả 2 pen,
 * và ghi audit log.
 */
export async function movePig(input: MovePigInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const { pigId, toPenId, reason } = input

    // Lấy thông tin lợn hiện tại
    const pig = await prisma.pig.findFirst({
      where: { id: pigId, farmId: user.farmId, deletedAt: null },
      select: { id: true, code: true, penId: true, name: true }
    })

    if (!pig) return { success: false, error: 'Không tìm thấy lợn' }

    const fromPenId = pig.penId

    if (fromPenId === toPenId) {
      return { success: false, error: 'Lợn đã ở trong ô chuồng này rồi' }
    }

    // Kiểm tra ô chuồng đích có thuộc farm không
    const targetPen = await prisma.pen.findFirst({
      where: {
        id: toPenId,
        deletedAt: null,
        isActive: true,
        barn: {
          row: {
            zone: {
              farmId: user.farmId
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            pigs: {
              where: { deletedAt: null, status: { not: 'DEAD' } }
            }
          }
        }
      }
    })

    if (!targetPen) {
      return { success: false, error: 'Không tìm thấy ô chuồng đích' }
    }

    // Kiểm tra sức chứa
    if (targetPen._count.pigs >= targetPen.capacity) {
      return {
        success: false,
        error: `Ô chuồng ${targetPen.name} đã đầy (${targetPen._count.pigs}/${targetPen.capacity})`
      }
    }

    // Thực hiện chuyển lợn trong transaction
    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật penId của lợn
      await tx.pig.update({
        where: { id: pigId },
        data: {
          penId: toPenId,
          updatedBy: user.id
        }
      })

      // 2. Giảm currentCount ở cũ
      if (fromPenId) {
        await tx.pen.update({
          where: { id: fromPenId },
          data: { currentCount: { decrement: 1 } }
        })

        // Kiểm tra nếu ô cũ trống thì đổi status
        const oldPenCount = await tx.pig.count({
          where: { penId: fromPenId, deletedAt: null, status: { not: 'DEAD' } }
        })
        if (oldPenCount <= 1) {
          await tx.pen.update({
            where: { id: fromPenId },
            data: { status: 'AVAILABLE' }
          })
        }
      }

      // 3. Tăng currentCount ô mới
      await tx.pen.update({
        where: { id: toPenId },
        data: {
          currentCount: { increment: 1 },
          status: 'OCCUPIED'
        }
      })

      // 4. Tạo bản ghi PigMovement
      await tx.pigMovement.create({
        data: {
          pigId,
          fromPenId: fromPenId || null,
          toPenId,
          reason: reason || 'Chuyển chuồng qua sơ đồ kéo thả',
          movedBy: user.id,
        }
      })

      // 5. Ghi audit log
      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'PIG',
        entityId: pigId,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: { penId: fromPenId },
        dataAfter: { penId: toPenId },
        description: `Chuyển lợn ${pig.code} sang ô ${targetPen.name}`
      })
    })

    revalidatePath('/barns/map')
    revalidatePath('/barns')
    revalidatePath('/pigs')

    return { success: true, data: true }
  } catch (error) {
    console.error('[MOVE_PIG]', error)
    return { success: false, error: 'Đã có lỗi xảy ra khi chuyển lợn' }
  }
}

export async function movePigToLayoutPen(input: {
  pigId: string;
  layoutCode: string;
  penName: string;
  reason?: string;
}): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    let pen = await prisma.pen.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        barn: { row: { zone: { farmId: user.farmId } } },
        OR: [
          { code: input.layoutCode },
          { name: input.layoutCode },
          { name: input.penName }
        ]
      }
    })

    if (!pen) {
      // Auto-create hierarchy if not exists
      let zone = await prisma.barnZone.findFirst({
        where: { farmId: user.farmId, name: 'Khu vực chung', deletedAt: null }
      })
      if (!zone) {
        zone = await prisma.barnZone.create({
          data: { farmId: user.farmId, name: 'Khu vực chung', code: 'Z-CHUNG' }
        })
      }

      let row = await prisma.barnRow.findFirst({
        where: { zoneId: zone.id, name: 'Dãy chung', deletedAt: null }
      })
      if (!row) {
        row = await prisma.barnRow.create({
          data: { zoneId: zone.id, name: 'Dãy chung', code: 'R-CHUNG' }
        })
      }

      let barn = await prisma.barn.findFirst({
        where: { rowId: row.id, name: 'Nhà chung', deletedAt: null }
      })
      if (!barn) {
        barn = await prisma.barn.create({
          data: { rowId: row.id, name: 'Nhà chung', code: 'B-CHUNG' }
        })
      }

      // Determine default type based on layoutCode prefix or name
      let type: 'GENERAL' | 'FATTENING' | 'MATING' | 'FARROWING' | 'NURSERY' | 'GILT_PEN' | 'BOAR_PEN' | 'QUARANTINE' = 'GENERAL'
      const lowerName = input.penName.toLowerCase()
      if (lowerName.includes('thịt')) type = 'FATTENING'
      else if (lowerName.includes('đẻ')) type = 'FARROWING'
      else if (lowerName.includes('con') || lowerName.includes('sữa')) type = 'NURSERY'
      else if (lowerName.includes('đực')) type = 'BOAR_PEN'
      else if (lowerName.includes('hậu bị')) type = 'GILT_PEN'

      pen = await prisma.pen.create({
        data: {
          barnId: barn.id,
          name: input.penName,
          code: input.layoutCode,
          type,
          capacity: 50,
          status: 'AVAILABLE'
        }
      })
    }

    return movePig({
      pigId: input.pigId,
      toPenId: pen.id,
      reason: input.reason
    })
  } catch (error) {
    console.error('[MOVE_PIG_TO_LAYOUT]', error)
    return { success: false, error: 'Đã có lỗi xảy ra khi tạo ô chuồng tự động' }
  }
}

export async function unassignPig(pigId: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const pig = await prisma.pig.findUnique({
      where: { id: pigId, deletedAt: null },
      include: { pen: true }
    })

    if (!pig || pig.farmId !== user.farmId) {
      return { success: false, error: 'Không tìm thấy lợn' }
    }

    const currentPenId = pig.penId;
    if (!currentPenId) {
      return { success: true, data: true }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update pig
      await tx.pig.update({
        where: { id: pigId },
        data: { penId: null, updatedBy: user.id }
      })

      // 2. Decrease count in old pen
      const oldPenCount = await tx.pig.count({
        where: { penId: currentPenId, deletedAt: null, id: { not: pigId } }
      })
      await tx.pen.update({
        where: { id: currentPenId },
        data: { 
          currentCount: { decrement: 1 },
          status: oldPenCount === 0 ? 'AVAILABLE' : 'OCCUPIED'
        }
      })

      // 3. Create PigMovement record
      await tx.pigMovement.create({
        data: {
          pigId,
          fromPenId: currentPenId,
          toPenId: null,
          reason: 'Rút khỏi chuồng về danh sách chờ',
          movedBy: user.id,
        }
      })

      // 4. Audit Log
      await createAuditLogTx(tx, {
        action: 'UPDATE',
        entity: 'PIG',
        entityId: pigId,
        farmId: user.farmId,
        userId: user.id,
        dataBefore: { penId: pig.penId },
        dataAfter: { penId: null },
        description: `Rút lợn ${pig.code} từ chuồng ${pig.pen?.name} về danh sách chờ`
      })
    })

    revalidatePath('/barns/map')
    revalidatePath('/barns')
    revalidatePath('/pigs')

    return { success: true, data: true }
  } catch (error) {
    console.error('[UNASSIGN_PIG]', error)
    return { success: false, error: 'Đã có lỗi xảy ra khi rút lợn' }
  }
}
