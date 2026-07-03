// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

export const farmUpdateSchema = z.object({
  name: z.string().min(2, 'Tên trang trại phải có ít nhất 2 ký tự').max(100, 'Tên trang trại tối đa 100 ký tự'),
  address: z.string().max(255, 'Địa chỉ tối đa 255 ký tự').optional().nullable(),
  phone: z.string().max(20, 'Số điện thoại tối đa 20 ký tự').optional().nullable(),
  email: z.string().email('Email không đúng định dạng').optional().nullable().or(z.literal('')),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional().nullable(),
})

export type FarmUpdateInput = z.infer<typeof farmUpdateSchema>

export const categorySchema = z.object({
  type: z.string().min(1, 'Vui lòng chọn hoặc nhập Loại danh mục'),
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  code: z.string().max(50, 'Mã danh mục tối đa 50 ký tự').optional().nullable(),
  isActive: z.boolean(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const unitSchema = z.object({
  name: z.string().min(1, 'Tên đơn vị không được để trống'),
  code: z.string().min(1, 'Mã đơn vị không được để trống'),
  description: z.string().max(255, 'Mô tả tối đa 255 ký tự').optional().nullable(),
  isActive: z.boolean(),
})

export type UnitInput = z.infer<typeof unitSchema>
