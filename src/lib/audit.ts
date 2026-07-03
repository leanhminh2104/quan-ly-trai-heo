// Bản quyền thuộc dalymmo.com
import { prisma } from './prisma'
import { AuditAction } from '@prisma/client'

/**
 * Parameters for creating an audit log entry
 */
interface AuditLogParams {
  farmId: string
  userId?: string
  action: AuditAction
  entity: string
  entityId?: string
  dataBefore?: unknown
  dataAfter?: unknown
  ipAddress?: string | null
  userAgent?: string | null
  description?: string
}

/**
 * Create an immutable audit log entry.
 * This function MUST be called after every create, update, delete, or status change.
 * Audit logs cannot be modified or deleted.
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        farmId: params.farmId,
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        dataBefore: params.dataBefore ? JSON.parse(JSON.stringify(params.dataBefore)) : undefined,
        dataAfter: params.dataAfter ? JSON.parse(JSON.stringify(params.dataAfter)) : undefined,
        ipAddress: params.ipAddress ?? undefined,
        userAgent: params.userAgent ?? undefined,
        description: params.description,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit logging should never break the main operation
    console.error('[AUDIT_LOG_ERROR]', error)
  }
}

/**
 * Create audit log with transaction support
 * Use this when you need to include audit log in a Prisma transaction
 */
export function createAuditLogTx(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  params: AuditLogParams
) {
  return tx.auditLog.create({
    data: {
      farmId: params.farmId,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      dataBefore: params.dataBefore ? JSON.parse(JSON.stringify(params.dataBefore)) : undefined,
      dataAfter: params.dataAfter ? JSON.parse(JSON.stringify(params.dataAfter)) : undefined,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
      description: params.description,
    },
  })
}

/**
 * Generate human-readable description for audit log
 */
export function generateAuditDescription(
  action: AuditAction,
  entity: string,
  entityName?: string
): string {
  const entityLabels: Record<string, string> = {
    PIG: 'lợn',
    BARN: 'chuồng',
    BARN_ZONE: 'khu',
    PEN: 'ô chuồng',
    MATING: 'phối giống',
    FARROWING: 'đẻ',
    VACCINATION: 'tiêm phòng',
    TREATMENT: 'điều trị',
    FEED: 'thức ăn',
    MEDICINE: 'thuốc',
    VACCINE: 'vaccine',
    SEMEN: 'tinh',
    INCOME: 'thu nhập',
    EXPENSE: 'chi phí',
    EMPLOYEE: 'nhân viên',
    TASK: 'công việc',
    SETTINGS: 'thiết lập',
  }

  const actionLabels: Record<string, string> = {
    CREATE: 'Tạo mới',
    UPDATE: 'Cập nhật',
    DELETE: 'Xóa',
    RESTORE: 'Khôi phục',
    STATUS_CHANGE: 'Đổi trạng thái',
    MOVE: 'Di chuyển',
    LOGIN: 'Đăng nhập',
    LOGOUT: 'Đăng xuất',
  }

  const entityLabel = entityLabels[entity] || entity.toLowerCase()
  const actionLabel = actionLabels[action] || action

  return entityName
    ? `${actionLabel} ${entityLabel}: ${entityName}`
    : `${actionLabel} ${entityLabel}`
}
