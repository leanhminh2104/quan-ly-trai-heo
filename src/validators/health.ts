// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

// Vaccination Validator
export const vaccinationSchema = z.object({
  pigId: z.string().min(1, 'Vui lòng chọn lợn'),
  vaccineTypeId: z.string().min(1, 'Vui lòng chọn loại vaccine'),
  vaccinatedAt: z.date({ required_error: 'Vui lòng chọn ngày tiêm' } as any),
  dosage: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  vaccinatedBy: z.string().optional().nullable(),
  nextDueDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type VaccinationInput = z.infer<typeof vaccinationSchema>

// Treatment Validator
export const treatmentSchema = z.object({
  pigId: z.string().min(1, 'Vui lòng chọn lợn'),
  medicineTypeId: z.string().optional().nullable(),
  diagnosis: z.string().min(1, 'Vui lòng nhập chẩn đoán'),
  symptoms: z.string().optional().nullable(),
  treatmentDate: z.date({ required_error: 'Vui lòng chọn ngày điều trị' } as any),
  medicineName: z.string().optional().nullable(),
  dosage: z.string().optional().nullable(),
  duration: z.coerce.number().int().min(1).default(1),
  cost: z.coerce.number().min(0).optional().nullable(),
  treatedBy: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type TreatmentInput = z.infer<typeof treatmentSchema>

// Query validators
export const queryHealthSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export type QueryHealthInput = z.infer<typeof queryHealthSchema>
