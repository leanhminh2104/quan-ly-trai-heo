import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import * as xlsx from 'xlsx'
import { format } from 'date-fns'

import { hasPermission } from '@/lib/rbac'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.farmId || !user.role) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!hasPermission(user.role, 'report:view')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const farmId = user.farmId

    // 1. Lấy thông tin tổng đàn
    const pigs = await prisma.pig.findMany({
      where: { farmId, status: { notIn: ['DEAD', 'SOLD', 'CULLED'] } },
      include: { pen: { include: { barn: true } }, breed: true }
    })

    const summaryData = [
      { 'Chỉ tiêu': 'Tổng đàn lợn', 'Giá trị': pigs.length },
      { 'Chỉ tiêu': 'Số lợn đực', 'Giá trị': pigs.filter(p => p.gender === 'MALE').length },
      { 'Chỉ tiêu': 'Số lợn nái', 'Giá trị': pigs.filter(p => p.gender === 'FEMALE').length },
      { 'Chỉ tiêu': 'Lợn đang điều trị', 'Giá trị': pigs.filter(p => p.status === 'TREATMENT').length },
      { 'Chỉ tiêu': 'Ngày xuất báo cáo', 'Giá trị': format(new Date(), 'dd/MM/yyyy HH:mm') }
    ]

    // 2. Danh sách đàn lợn chi tiết
    const pigListData = pigs.map(p => ({
      'Mã lợn': p.code,
      'Giới tính': p.gender === 'MALE' ? 'Đực' : p.gender === 'FEMALE' ? 'Nái' : 'Chưa rõ',
      'Chuồng': p.pen?.barn?.code || 'Chưa xếp chuồng',
      'Ô chuồng': p.pen?.code || '',
      'Giai đoạn': p.type,
      'Giống': p.breed?.name || '',
      'Trạng thái': p.status,
      'Ngày nhập': p.createdAt ? format(new Date(p.createdAt), 'dd/MM/yyyy') : ''
    }))

    // 3. Tài chính (Thu chi tháng này)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: { farmId, date: { gte: startOfMonth }, deletedAt: null }
      }),
      prisma.expense.findMany({
        where: { farmId, date: { gte: startOfMonth }, deletedAt: null }
      })
    ])

    const transactions = [
      ...incomes.map(i => ({ ...i, type: 'INCOME' })),
      ...expenses.map(e => ({ ...e, type: 'EXPENSE' }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    const financeData = transactions.map(t => ({
      'Ngày giao dịch': format(new Date(t.date), 'dd/MM/yyyy'),
      'Loại': t.type === 'INCOME' ? 'Thu' : 'Chi',
      'Danh mục': t.type,
      'Số tiền (VNĐ)': t.amount,
      'Mô tả': t.description || ''
    }))

    // Tạo Workbook
    const wb = xlsx.utils.book_new()
    
    const wsSummary = xlsx.utils.json_to_sheet(summaryData)
    xlsx.utils.book_append_sheet(wb, wsSummary, 'Tổng quan')

    const wsPigs = xlsx.utils.json_to_sheet(pigListData)
    xlsx.utils.book_append_sheet(wb, wsPigs, 'Danh sách lợn')

    const wsFinance = xlsx.utils.json_to_sheet(financeData)
    xlsx.utils.book_append_sheet(wb, wsFinance, 'Thu chi tháng')

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="BaoCao_TrangTrai_${format(new Date(), 'yyyyMMdd')}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Export excel error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
