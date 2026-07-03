// Bản quyền thuộc dalymmo.com
import { z } from 'zod'
import { IncomeType, ExpenseType } from '@prisma/client'

export const incomeSchema = z.object({
  type: z.nativeEnum(IncomeType, { required_error: 'Vui lòng chọn loại thu' } as any),
  amount: z.coerce.number().min(0, 'Số tiền không hợp lệ'),
  date: z.date().default(() => new Date()),
  description: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  customer: z.string().optional().nullable(),
  pigCount: z.coerce.number().int().optional().nullable(),
  totalWeight: z.coerce.number().optional().nullable(),
  pricePerKg: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type IncomeInput = z.infer<typeof incomeSchema>

export const expenseSchema = z.object({
  type: z.nativeEnum(ExpenseType, { required_error: 'Vui lòng chọn loại chi' } as any),
  amount: z.coerce.number().min(0, 'Số tiền không hợp lệ'),
  date: z.date().default(() => new Date()),
  description: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

// Backward compatible aliases
export const transactionSchema = z.discriminatedUnion('_kind', [
  incomeSchema.extend({ _kind: z.literal('income') }),
  expenseSchema.extend({ _kind: z.literal('expense') }),
])

export type TransactionInput = IncomeInput | ExpenseInput

export const queryFinanceSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  tab: z.enum(['all', 'income', 'expense']).default('all'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export type QueryFinanceInput = z.infer<typeof queryFinanceSchema>
