'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { 
  BarnZoneInput, barnZoneSchema,
  BarnRowInput, barnRowSchema,
  BarnInput, barnSchema
} from '@/validators/barn'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/rbac'
import { createAuditLogTx } from '@/lib/audit'
import { BarnZone, BarnRow, Barn } from '@prisma/client'

// ==========================================
// BarnZone Actions
// ==========================================

export async function createBarnZone(data: BarnZoneInput): Promise<ActionResponse<BarnZone>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:create')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnZoneSchema.parse(data)

    const existing = await prisma.barnZone.findUnique({
      where: { farmId_code: { farmId: user.farmId, code: validated.code } }
    })
    if (existing && !existing.deletedAt) return { success: false, error: 'Mã khu vực đã tồn tại' }

    const zone = await prisma.$transaction(async (tx) => {
      const z = await tx.barnZone.create({
        data: { ...validated, farmId: user.farmId, createdBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'CREATE', entity: 'BARN_ZONE', entityId: z.id,
        farmId: user.farmId, userId: user.id, dataAfter: z,
        description: `Tạo khu vực mới: ${z.name}`
      })
      return z
    })

    revalidatePath('/barns/structure')
    return { success: true, data: zone }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi tạo khu vực' }
  }
}

export async function updateBarnZone(id: string, data: BarnZoneInput): Promise<ActionResponse<BarnZone>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:edit')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnZoneSchema.parse(data)
    
    const existing = await prisma.barnZone.findUnique({ where: { id } })
    if (!existing || existing.farmId !== user.farmId) return { success: false, error: 'Khu vực không tồn tại' }

    if (validated.code !== existing.code) {
      const duplicate = await prisma.barnZone.findUnique({
        where: { farmId_code: { farmId: user.farmId, code: validated.code } }
      })
      if (duplicate && duplicate.id !== id && !duplicate.deletedAt) return { success: false, error: 'Mã khu vực đã tồn tại' }
    }

    const zone = await prisma.$transaction(async (tx) => {
      const z = await tx.barnZone.update({
        where: { id },
        data: { ...validated, updatedBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'UPDATE', entity: 'BARN_ZONE', entityId: z.id,
        farmId: user.farmId, userId: user.id, dataBefore: existing, dataAfter: z,
        description: `Cập nhật khu vực: ${z.name}`
      })
      return z
    })

    revalidatePath('/barns/structure')
    return { success: true, data: zone }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật' }
  }
}

export async function deleteBarnZone(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:delete')) return { success: false, error: 'Không có quyền truy cập' }

    const existing = await prisma.barnZone.findUnique({ 
      where: { id },
      include: { rows: { where: { deletedAt: null } } }
    })
    
    if (!existing || existing.farmId !== user.farmId || existing.deletedAt) return { success: false, error: 'Khu vực không tồn tại' }
    if (existing.rows.length > 0) return { success: false, error: 'Không thể xóa khu vực đang chứa dãy chuồng' }

    await prisma.$transaction(async (tx) => {
      await tx.barnZone.update({
        where: { id },
        data: { deletedAt: new Date(), updatedBy: user.id, isActive: false }
      })
      await createAuditLogTx(tx, {
        action: 'DELETE', entity: 'BARN_ZONE', entityId: id,
        farmId: user.farmId, userId: user.id, dataBefore: existing,
        description: `Xóa khu vực: ${existing.name}`
      })
    })

    revalidatePath('/barns/structure')
    return { success: true, data: true }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi xóa' }
  }
}

// ==========================================
// BarnRow Actions
// ==========================================

export async function createBarnRow(data: BarnRowInput): Promise<ActionResponse<BarnRow>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:create')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnRowSchema.parse(data)
    
    const row = await prisma.$transaction(async (tx) => {
      const r = await tx.barnRow.create({
        data: { ...validated, createdBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'CREATE', entity: 'BARN_ROW', entityId: r.id,
        farmId: user.farmId, userId: user.id, dataAfter: r,
        description: `Tạo dãy chuồng mới: ${r.name}`
      })
      return r
    })

    revalidatePath('/barns/structure')
    return { success: true, data: row }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi tạo dãy' }
  }
}

export async function updateBarnRow(id: string, data: BarnRowInput): Promise<ActionResponse<BarnRow>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:update')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnRowSchema.parse(data)
    const existing = await prisma.barnRow.findUnique({ where: { id }, include: { zone: true } })
    if (!existing) return { success: false, error: 'Dãy không tồn tại' }
    if (existing.zone.farmId !== user.farmId) return { success: false, error: 'Không có quyền truy cập' }

    const row = await prisma.$transaction(async (tx) => {
      const r = await tx.barnRow.update({
        where: { id },
        data: { ...validated, updatedBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'UPDATE', entity: 'BARN_ROW', entityId: r.id,
        farmId: user.farmId, userId: user.id, dataBefore: existing, dataAfter: r,
        description: `Cập nhật dãy: ${r.name}`
      })
      return r
    })

    revalidatePath('/barns/structure')
    return { success: true, data: row }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật' }
  }
}

export async function deleteBarnRow(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:delete')) return { success: false, error: 'Không có quyền truy cập' }

    const existing = await prisma.barnRow.findUnique({ 
      where: { id },
      include: { barns: { where: { deletedAt: null } }, zone: true }
    })
    
    if (!existing || existing.deletedAt) return { success: false, error: 'Dãy không tồn tại' }
    if (existing.zone.farmId !== user.farmId) return { success: false, error: 'Không có quyền truy cập' }
    if (existing.barns.length > 0) return { success: false, error: 'Không thể xóa dãy đang chứa nhà chuồng' }

    await prisma.$transaction(async (tx) => {
      await tx.barnRow.update({
        where: { id },
        data: { deletedAt: new Date(), updatedBy: user.id, isActive: false }
      })
      await createAuditLogTx(tx, {
        action: 'DELETE', entity: 'BARN_ROW', entityId: id,
        farmId: user.farmId, userId: user.id, dataBefore: existing,
        description: `Xóa dãy: ${existing.name}`
      })
    })

    revalidatePath('/barns/structure')
    return { success: true, data: true }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi xóa' }
  }
}

// ==========================================
// Barn (Nhà Chuồng) Actions
// ==========================================

export async function createBarnLoc(data: BarnInput): Promise<ActionResponse<Barn>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:create')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnSchema.parse(data)
    
    const barn = await prisma.$transaction(async (tx) => {
      const b = await tx.barn.create({
        data: { ...validated, createdBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'CREATE', entity: 'BARN', entityId: b.id,
        farmId: user.farmId, userId: user.id, dataAfter: b,
        description: `Tạo nhà chuồng mới: ${b.name}`
      })
      return b
    })

    revalidatePath('/barns/structure')
    return { success: true, data: barn }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi tạo nhà chuồng' }
  }
}

export async function updateBarnLoc(id: string, data: BarnInput): Promise<ActionResponse<Barn>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:edit')) return { success: false, error: 'Không có quyền truy cập' }

    const validated = barnSchema.parse(data)
    const existing = await prisma.barn.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Nhà chuồng không tồn tại' }

    const barn = await prisma.$transaction(async (tx) => {
      const b = await tx.barn.update({
        where: { id },
        data: { ...validated, updatedBy: user.id }
      })
      await createAuditLogTx(tx, {
        action: 'UPDATE', entity: 'BARN', entityId: b.id,
        farmId: user.farmId, userId: user.id, dataBefore: existing, dataAfter: b,
        description: `Cập nhật nhà chuồng: ${b.name}`
      })
      return b
    })

    revalidatePath('/barns/structure')
    return { success: true, data: barn }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi cập nhật' }
  }
}

export async function deleteBarnLoc(id: string): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    if (!hasPermission(user.role, 'barn:delete')) return { success: false, error: 'Không có quyền truy cập' }

    const existing = await prisma.barn.findUnique({ 
      where: { id },
      include: { pens: { where: { deletedAt: null } } }
    })
    
    if (!existing || existing.deletedAt) return { success: false, error: 'Nhà chuồng không tồn tại' }
    if (existing.pens.length > 0) return { success: false, error: 'Không thể xóa nhà đang chứa ô chuồng' }

    await prisma.$transaction(async (tx) => {
      await tx.barn.update({
        where: { id },
        data: { deletedAt: new Date(), updatedBy: user.id, isActive: false }
      })
      await createAuditLogTx(tx, {
        action: 'DELETE', entity: 'BARN', entityId: id,
        farmId: user.farmId, userId: user.id, dataBefore: existing,
        description: `Xóa nhà chuồng: ${existing.name}`
      })
    })

    revalidatePath('/barns/structure')
    return { success: true, data: true }
  } catch (error) {
    return { success: false, error: 'Có lỗi xảy ra khi xóa' }
  }
}
