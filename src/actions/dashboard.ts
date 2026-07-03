'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths, addDays } from 'date-fns'

export async function getDashboardStats(): Promise<ActionResponse<any>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }
    const farmId = user.farmId

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // 1. Tổng đàn
    const totalPigs = await prisma.pig.count({ where: { farmId, deletedAt: null, status: { notIn: ['SOLD', 'DEAD'] } } })
    
    // 2. Chuồng trống / Hoạt động
    const totalBarns = await prisma.barn.count({ where: { row: { zone: { farmId } }, isActive: true, deletedAt: null } })
    const activeBarns = await prisma.barn.count({ where: { row: { zone: { farmId } }, isActive: true, deletedAt: null, pens: { some: { pigs: { some: { status: { notIn: ['SOLD', 'DEAD'] }, deletedAt: null } } } } } })
    
    // 3. Lợn nái
    const totalSows = await prisma.pig.count({ where: { farmId, deletedAt: null, gender: 'FEMALE', type: 'SOW', status: { notIn: ['SOLD', 'DEAD'] } } })
    
    // 4. Đang điều trị
    const treatingPigs = await prisma.pig.count({ where: { farmId, deletedAt: null, status: 'TREATMENT' } })
    
    // 5. Sắp đẻ (7 ngày)
    const next7Days = addDays(now, 7)
    const farrowingSows = await prisma.mating.count({
      where: {
        sow: { farmId },
        status: 'PREGNANT',
        expectedFarrowingDate: { gte: now, lte: next7Days }
      }
    })

    const pendingVaccines = await prisma.pig.count({
      where: { farmId, deletedAt: null, status: 'ACTIVE', vaccinations: { none: {} } }
    })

    // 7. Doanh thu tháng
    const [revenueThisMonth, revenueLastMonth, expenseThisMonth, expenseLastMonth] = await Promise.all([
      prisma.income.aggregate({ where: { farmId, date: { gte: monthStart, lte: monthEnd }, deletedAt: null }, _sum: { amount: true } }),
      prisma.income.aggregate({ where: { farmId, date: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { farmId, date: { gte: monthStart, lte: monthEnd }, deletedAt: null }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { farmId, date: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null }, _sum: { amount: true } }),
    ])

    return {
      success: true,
      data: {
        totalPigs,
        totalSows,
        totalBarns,
        emptyBarns: totalBarns - activeBarns,
        treatingPigs,
        farrowingSows,
        pendingVaccines,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        revenueLastMonth: revenueLastMonth._sum.amount || 0,
        expenseThisMonth: expenseThisMonth._sum.amount || 0,
        expenseLastMonth: expenseLastMonth._sum.amount || 0,
      }
    }
  } catch (error) {
    console.error('Lỗi lấy dashboard stats:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function getDashboardAlerts(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    // Fallback if no notifications exist: generate mock alerts for demonstration
    // Real app would fetch from Notification table. We'll try fetching first.
    const alerts = await prisma.notification.findMany({
      where: { farmId: user.farmId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return { success: true, data: alerts }
  } catch (error) {
    console.error('Lỗi lấy alerts:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function getUpcomingTasks(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const now = new Date()
    const tasks = await prisma.task.findMany({
      where: { 
        farmId: user.farmId, 
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    })

    return { success: true, data: tasks }
  } catch (error) {
    console.error('Lỗi lấy upcoming tasks:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}

export async function getDashboardRecentActivities(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const logs = await prisma.auditLog.findMany({
      where: { farmId: user.farmId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { id: 'desc' },
      take: 5
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error('Lỗi lấy recent activities:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
