// Bản quyền thuộc dalymmo.com
import { Income, Expense } from '@prisma/client'

export type TransactionWithDetails = (Income | Expense) & {
  _type: 'income' | 'expense'
}
