'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse, PaginatedResponse } from '@/types/common'
import { IncomeInput, ExpenseInput, QueryFinanceInput, incomeSchema, expenseSchema, queryFinanceSchema } from '@/validators/finance'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { createAuditLogTx } from '@/lib/audit'
import { Prisma } from '@prisma/client'

/**
 * Lấy danh sách thu nhập
 */
export async function getIncomes(params: QueryFinanceInput): Promise<ActionResponse<PaginatedResponse<any>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryFinanceSchema.parse(params)
    const { page, pageSize, search, startDate, endDate } = validated
    const skip = (page - 1) * pageSize

    const where: Prisma.IncomeWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(startDate && endDate && {
        date: { gte: startDate, lte: endDate }
      })
    }

    const total = await prisma.income.count({ where })
    const items = await prisma.income.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { date: 'desc' }
    })

    return {
      success: true,
      data: {
        items: items.map(i => ({ ...i, _type: 'income' as const })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thu:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Lấy danh sách chi phí
 */
export async function getExpenses(params: QueryFinanceInput): Promise<ActionResponse<PaginatedResponse<any>>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = queryFinanceSchema.parse(params)
    const { page, pageSize, search, startDate, endDate } = validated
    const skip = (page - 1) * pageSize

    const where: Prisma.ExpenseWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(startDate && endDate && {
        date: { gte: startDate, lte: endDate }
      })
    }

    const total = await prisma.expense.count({ where })
    const items = await prisma.expense.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { date: 'desc' }
    })

    return {
      success: true,
      data: {
        items: items.map(i => ({ ...i, _type: 'expense' as const })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chi:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Backward compatible: getTransactions delegates to getIncomes or getExpenses
 */
export async function getTransactions(params: QueryFinanceInput): Promise<ActionResponse<PaginatedResponse<any>>> {
  const validated = queryFinanceSchema.parse(params)
  if (validated.tab === 'expense') {
    return getExpenses(params)
  }
  if (validated.tab === 'income') {
    return getIncomes(params)
  }
  
  // For 'all', combine both in memory (suitable for typical farm transaction volume)
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const { page, pageSize, search, startDate, endDate } = validated
    const skip = (page - 1) * pageSize

    const where: Prisma.IncomeWhereInput = {
      farmId: user.farmId,
      deletedAt: null,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(startDate && endDate && {
        date: { gte: startDate, lte: endDate }
      })
    }

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.expense.findMany({ where: where as Prisma.ExpenseWhereInput, orderBy: { date: 'desc' } })
    ])

    const allItems = [
      ...incomes.map(i => ({ ...i, _type: 'income' as const })),
      ...expenses.map(i => ({ ...i, _type: 'expense' as const }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    const total = allItems.length
    const paginatedItems = allItems.slice(skip, skip + pageSize)

    return {
      success: true,
      data: {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }
  } catch (error) {
    console.error('Lỗi khi lấy tất cả giao dịch:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Tạo phiếu thu
 */
export async function createIncome(data: IncomeInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = incomeSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const record = await tx.income.create({
        data: {
          ...validated,
          farmId: user.farmId,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'FINANCE',
        entityId: record.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: record,
        description: `Tạo phiếu Thu: ${validated.amount} VNĐ`
      })
    })

    revalidatePath('/finance')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi tạo phiếu thu:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Tạo phiếu chi
 */
export async function createExpense(data: ExpenseInput): Promise<ActionResponse<boolean>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const validated = expenseSchema.parse(data)

    await prisma.$transaction(async (tx) => {
      const record = await tx.expense.create({
        data: {
          ...validated,
          farmId: user.farmId,
          createdBy: user.id
        }
      })

      await createAuditLogTx(tx, {
        action: 'CREATE',
        entity: 'FINANCE',
        entityId: record.id,
        farmId: user.farmId,
        userId: user.id,
        dataAfter: record,
        description: `Tạo phiếu Chi: ${validated.amount} VNĐ`
      })
    })

    revalidatePath('/finance')
    return { success: true, data: true }
  } catch (error) {
    console.error('Lỗi tạo phiếu chi:', error)
    return { success: false, error: 'Có lỗi xảy ra' }
  }
}

/**
 * Backward compatible: createTransaction
 */
export async function createTransaction(data: any): Promise<ActionResponse<boolean>> {
  if (data.type && ['PIG_SALE', 'MANURE_SALE', 'OTHER_INCOME'].includes(data.type)) {
    return createIncome(data)
  }
  return createExpense(data)
}
