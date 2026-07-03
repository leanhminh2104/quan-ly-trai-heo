// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { PenType, PenStatus } from '@prisma/client'

// BarnZone Validators
export const barnZoneSchema = z.object({
  name: z.string().min(1, 'Tên khu vực không được để trống'),
  code: z.string().min(1, 'Mã khu vực không được để trống'),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type BarnZoneInput = z.infer<typeof barnZoneSchema>

// BarnRow Validators
export const barnRowSchema = z.object({
  zoneId: z.string().min(1, 'Vui lòng chọn khu vực'),
  name: z.string().min(1, 'Tên dãy không được để trống'),
  code: z.string().min(1, 'Mã dãy không được để trống'),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type BarnRowInput = z.infer<typeof barnRowSchema>

// Barn Validators
export const barnSchema = z.object({
  rowId: z.string().min(1, 'Vui lòng chọn dãy'),
  name: z.string().min(1, 'Tên chuồng không được để trống'),
  code: z.string().min(1, 'Mã chuồng không được để trống'),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type BarnInput = z.infer<typeof barnSchema>

// Pen Validators
export const penSchema = z.object({
  barnId: z.string().min(1, 'Vui lòng chọn chuồng'),
  name: z.string().min(1, 'Tên ô chuồng không được để trống'),
  code: z.string().min(1, 'Mã ô chuồng không được để trống'),
  type: z.nativeEnum(PenType).default('GENERAL'),
  status: z.nativeEnum(PenStatus).default('AVAILABLE'),
  area: z.coerce.number().min(0).optional().nullable(),
  capacity: z.coerce.number().int().min(1, 'Sức chứa tối thiểu là 1'),
  temperature: z.coerce.number().optional().nullable(),
  humidity: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  positionX: z.coerce.number().optional().nullable(),
  positionY: z.coerce.number().optional().nullable(),
  width: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type PenInput = z.infer<typeof penSchema>

// Alias for backwards compatibility with the existing action
export const createBarnSchema = penSchema
export type CreateBarnInput = z.infer<typeof createBarnSchema>
export const updateBarnSchema = createBarnSchema.extend({
  id: z.string().min(1)
})
export type UpdateBarnInput = z.infer<typeof updateBarnSchema>

export const queryBarnSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  type: z.nativeEnum(PenType).optional(),
  status: z.nativeEnum(PenStatus).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type QueryBarnInput = z.infer<typeof queryBarnSchema>
