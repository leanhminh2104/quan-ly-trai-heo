// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

export const feedStockSchema = z.object({
  feedTypeId: z.string().min(1, 'Vui lòng chọn loại cám'),
  quantity: z.coerce.number().min(0, 'Số lượng không hợp lệ'),
  unitPrice: z.coerce.number().min(0, 'Đơn giá không hợp lệ').optional(),
  supplierId: z.string().optional().nullable(),
  importDate: z.date().default(() => new Date()),
  expiryDate: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type FeedStockInput = z.infer<typeof feedStockSchema>

export const medicineStockSchema = z.object({
  medicineTypeId: z.string().min(1, 'Vui lòng chọn loại thuốc'),
  quantity: z.coerce.number().min(0, 'Số lượng không hợp lệ'),
  unitPrice: z.coerce.number().min(0, 'Đơn giá không hợp lệ').optional(),
  supplierId: z.string().optional().nullable(),
  importDate: z.date().default(() => new Date()),
  expiryDate: z.date().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type MedicineStockInput = z.infer<typeof medicineStockSchema>

export const queryInventorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
})

export type QueryInventoryInput = z.infer<typeof queryInventorySchema>
