// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên nhân viên'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email không hợp lệ').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  startDate: z.date().optional().nullable(),
  salary: z.number().min(0, 'Lương không được âm').optional().nullable(),
  assignedZoneId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

export const updateEmployeeSchema = createEmployeeSchema.extend({
  id: z.string().min(1, 'ID không hợp lệ'),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

export const queryEmployeeSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'name', 'startDate', 'salary']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type QueryEmployeeInput = z.infer<typeof queryEmployeeSchema>
