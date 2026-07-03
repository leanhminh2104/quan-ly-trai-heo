'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { eachMonthOfInterval, format } from 'date-fns'

export interface SummaryStats {
  totalPigs: number
  activeBarns: number
  totalEmployees: number
  pendingTasks: number
  revenueThisMonth: number
  expenseThisMonth: number
}

export async function getSummaryStats(): Promise<ActionResponse<SummaryStats>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const [totalPigs, activeBarns, totalEmployees, pendingTasks] = await Promise.all([
      prisma.pig.count({ where: { farmId: user.farmId, status: 'ACTIVE', deletedAt: null } }),
      prisma.barn.count({ where: { row: { zone: { farmId: user.farmId } }, isActive: true, deletedAt: null } }),
      prisma.farmMember.count({ where: { farmId: user.farmId, isActive: true } }),
      prisma.task.count({ where: { farmId: user.farmId, status: 'PENDING', deletedAt: null } })
    ])

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const [revenueRes, expenseRes] = await Promise.all([
      prisma.income.aggregate({
        where: { farmId: user.farmId, deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { farmId: user.farmId, deletedAt: null, date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true }
      })
    ])

    return {
      success: true,
      data: {
        totalPigs,
        activeBarns,
        totalEmployees,
        pendingTasks,
        revenueThisMonth: revenueRes._sum?.amount || 0,
        expenseThisMonth: expenseRes._sum?.amount || 0,
      }
    }
  } catch (error) {
    console.error('Lỗi lấy summary stats:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export interface FinancialStat {
  month: string
  income: number
  expense: number
}

export async function getFinancialStats(year: number): Promise<ActionResponse<FinancialStat[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: { farmId: user.farmId, deletedAt: null, date: { gte: startDate, lte: endDate } },
        select: { amount: true, date: true }
      }),
      prisma.expense.findMany({
        where: { farmId: user.farmId, deletedAt: null, date: { gte: startDate, lte: endDate } },
        select: { amount: true, date: true }
      })
    ])

    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    const data = months.map(monthDate => {
      const monthStr = format(monthDate, 'MM/yyyy')
      const mStart = monthDate.getTime()
      const mEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59).getTime()

      const monthIncomes = incomes.filter(i => {
        const t = i.date.getTime()
        return t >= mStart && t <= mEnd
      }).reduce((sum, item) => sum + item.amount, 0)

      const monthExpenses = expenses.filter(i => {
        const t = i.date.getTime()
        return t >= mStart && t <= mEnd
      }).reduce((sum, item) => sum + item.amount, 0)

      return {
        month: monthStr,
        income: monthIncomes,
        expense: monthExpenses,
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Lỗi lấy financial stats:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export interface PopulationStat {
  name: string
  value: number
  color: string
}

export async function getPopulationStats(): Promise<ActionResponse<PopulationStat[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId) return { success: false, error: 'Chưa đăng nhập hoặc chưa có trang trại' }

    const stats = await prisma.pig.groupBy({
      by: ['status'],
      where: { farmId: user.farmId, deletedAt: null },
      _count: { _all: true }
    })

    const STATUS_MAP: Record<string, { label: string, color: string }> = {
      ACTIVE: { label: 'Đang nuôi', color: '#10b981' },
      PREGNANT: { label: 'Mang thai', color: '#8b5cf6' },
      NURSING: { label: 'Nuôi con', color: '#ec4899' },
      FATTENING: { label: 'Nuôi thịt', color: '#3b82f6' },
      TREATMENT: { label: 'Đang điều trị', color: '#f59e0b' },
      SOLD: { label: 'Đã xuất chuồng', color: '#06b6d4' },
      CULLED: { label: 'Đã loại', color: '#64748b' },
      DEAD: { label: 'Chết', color: '#ef4444' },
      IMPORTED: { label: 'Mới nhập', color: '#14b8a6' },
    }

    const data: PopulationStat[] = stats.map(s => {
      const mapping = STATUS_MAP[s.status] || { label: s.status, color: '#9ca3af' }
      return {
        name: mapping.label,
        value: (s._count as any)?._all || 0,
        color: mapping.color,
      }
    }).filter(d => d.value > 0)

    // Sort by value desc
    data.sort((a, b) => b.value - a.value)

    return { success: true, data }
  } catch (error) {
    console.error('Lỗi lấy population stats:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
