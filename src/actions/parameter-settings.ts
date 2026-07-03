'use server'
// Bản quyền thuộc dalymmo.com

import { prisma } from '@/lib/prisma'
import { ActionResponse } from '@/types/common'
import { getCurrentUser } from '@/lib/auth'

export async function getSystemParameters(): Promise<ActionResponse<any[]>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.farmId || !user.role) return { success: false, error: 'Tài khoản chưa được kích hoạt hoặc thiếu thông tin' }

    const params = await prisma.systemParameter.findMany({
      where: { farmId: user.farmId },
      orderBy: { key: 'asc' }
    })

    return { success: true, data: params }
  } catch (error) {
    console.error('Lỗi lấy system parameters:', error)
    return { success: false, error: 'Lỗi hệ thống' }
  }
}
