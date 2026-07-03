// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { BreedingStatus, MatingResult, UltrasoundResult, PigGender } from '@prisma/client'

// Mating Validator
export const matingSchema = z.object({
  sowId: z.string().min(1, 'Vui lòng chọn lợn nái'),
  boarId: z.string().optional().nullable(),
  semenStockId: z.string().optional().nullable(),
  matingDate: z.date(),
  matingNumber: z.coerce.number().int().min(1).default(1),
  technician: z.string().optional().nullable(),
  cost: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type MatingInput = z.infer<typeof matingSchema>

// Ultrasound Validator
export const ultrasoundSchema = z.object({
  matingId: z.string().min(1, 'Thiếu ID phối giống'),
  ultrasoundDate: z.date({ invalid_type_error: 'Vui lòng chọn ngày siêu âm', required_error: 'Vui lòng chọn ngày siêu âm' } as any),
  ultrasoundResult: z.nativeEnum(UltrasoundResult),
  ultrasoundFetusCount: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type UltrasoundInput = z.infer<typeof ultrasoundSchema>

// Farrowing Validator
export const farrowingSchema = z.object({
  matingId: z.string().min(1, 'Thiếu ID phối giống'),
  penId: z.string().optional().nullable(),
  farrowingDate: z.date({ required_error: 'Vui lòng chọn ngày đẻ' } as any),
  startTime: z.date().optional().nullable(),
  endTime: z.date().optional().nullable(),
  attendant: z.string().optional().nullable(),
  bornAlive: z.coerce.number().int().min(0).default(0),
  bornDead: z.coerce.number().int().min(0).default(0),
  mummified: z.coerce.number().int().min(0).default(0),
  avgBirthWeight: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type FarrowingInput = z.infer<typeof farrowingSchema>

// Weaning Validator
export const weaningSchema = z.object({
  farrowingId: z.string().min(1, 'Thiếu ID ổ đẻ'),
  weanedCount: z.coerce.number().int().min(0),
  weaningDate: z.date({ required_error: 'Vui lòng chọn ngày cai sữa' } as any),
  avgWeaningWeight: z.coerce.number().min(0).optional().nullable(),
  sowAction: z.enum(['RETURN_TO_MATING', 'CULL', 'TREATMENT']).default('RETURN_TO_MATING'),
  pigletAction: z.enum(['MOVE_TO_NURSERY', 'SELL']).default('MOVE_TO_NURSERY'),
  notes: z.string().optional().nullable(),
})

export type WeaningInput = z.infer<typeof weaningSchema>

export const queryBreedingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(BreedingStatus).optional(),
  result: z.nativeEnum(MatingResult).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export type QueryBreedingInput = z.infer<typeof queryBreedingSchema>
