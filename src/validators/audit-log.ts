// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { AuditAction } from '@prisma/client'

export const queryAuditLogSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  action: z.nativeEnum(AuditAction).optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type QueryAuditLogInput = z.infer<typeof queryAuditLogSchema>
