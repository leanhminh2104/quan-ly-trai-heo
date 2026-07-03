// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { PigGender, PigType, PigStatus } from '@prisma/client'

export const pigSchema = z.object({
  code: z.string().min(1, 'Mã lợn không được để trống'),
  earTag: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  breedId: z.string().optional().nullable(),
  gender: z.nativeEnum(PigGender),
  type: z.nativeEnum(PigType),
  status: z.nativeEnum(PigStatus).default('ACTIVE'),
  birthDate: z.date().optional().nullable(),
  importDate: z.date().optional().nullable(),
  importSource: z.string().optional().nullable(),
  importPrice: z.coerce.number().min(0).optional().nullable(),
  currentWeight: z.coerce.number().min(0).optional().nullable(),
  penId: z.string().optional().nullable(),
  fatherId: z.string().optional().nullable(),
  motherId: z.string().optional().nullable(),
  markerColor: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type PigInput = z.infer<typeof pigSchema>

export const createPigSchema = pigSchema
export type CreatePigInput = z.infer<typeof createPigSchema>

export const updatePigSchema = pigSchema.extend({
  id: z.string().min(1)
})
export type UpdatePigInput = z.infer<typeof updatePigSchema>

export const queryPigSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  type: z.nativeEnum(PigType).optional(),
  status: z.nativeEnum(PigStatus).optional(),
  gender: z.nativeEnum(PigGender).optional(),
  penId: z.string().optional(),
  breedId: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type QueryPigInput = z.infer<typeof queryPigSchema>
