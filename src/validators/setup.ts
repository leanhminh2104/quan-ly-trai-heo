// Bản quyền thuộc dalymmo.com
import { z } from 'zod'

export const setupSystemSchema = z.object({
  // Admin Info
  adminName: z.string().min(2, 'Tên quản trị viên phải có ít nhất 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  
  // Farm Info
  farmName: z.string().min(2, 'Tên trại phải có ít nhất 2 ký tự').max(100),
  farmCode: z.string().min(2, 'Mã trại phải có ít nhất 2 ký tự').max(50).toUpperCase(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export type SetupSystemInput = z.infer<typeof setupSystemSchema>
