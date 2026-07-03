// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

/**
 * Pagination input validator
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
})

/**
 * Date range validator
 */
export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine(
  (data) => data.from <= data.to,
  { message: 'Ngày bắt đầu phải trước ngày kết thúc' }
)

/**
 * ID validator
 */
export const idSchema = z.object({
  id: z.string().min(1, 'ID không hợp lệ'),
})

/**
 * Common notes field
 */
export const notesSchema = z.string().max(2000, 'Ghi chú tối đa 2000 ký tự').optional()

/**
 * Image URLs array
 */
export const imagesSchema = z.array(z.string().url('URL ảnh không hợp lệ')).optional()

export type PaginationInput = z.infer<typeof paginationSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
