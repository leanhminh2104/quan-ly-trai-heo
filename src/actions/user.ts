// Bản quyền thuộc dalymmo.com
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'

export async function toggleUserActivation(userId: string, isActive: boolean) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.farmId) {
      return { success: false, error: 'Chưa đăng nhập hoặc không có trang trại' }
    }

    if (currentUser.role !== 'OWNER') {
      return { success: false, error: 'Chỉ Chủ trại mới có quyền kích hoạt tài khoản' }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id: userId },
        data: { isActive },
      })

      // 2. If activating, add to FarmMember if not exists
      if (isActive) {
        const existingMember = await tx.farmMember.findUnique({
          where: {
            farmId_userId: {
              farmId: currentUser.farmId!,
              userId: userId
            }
          }
        })

        if (!existingMember) {
          await tx.farmMember.create({
            data: {
              farmId: currentUser.farmId!,
              userId: userId,
              role: 'VIEWER',
              isActive: true,
            }
          })
        } else if (!existingMember.isActive) {
          // If member exists but was deactivated, reactivate them
          await tx.farmMember.update({
            where: { id: existingMember.id },
            data: { isActive: true }
          })
        }
      } else {
        // If deactivating, also deactivate FarmMember
        const existingMember = await tx.farmMember.findUnique({
          where: {
            farmId_userId: {
              farmId: currentUser.farmId!,
              userId: userId
            }
          }
        })
        if (existingMember) {
          await tx.farmMember.update({
            where: { id: existingMember.id },
            data: { isActive: false }
          })
        }
      }
    })

    revalidatePath('/settings/roles')
    return { success: true }
  } catch (error: any) {
    console.error('Error toggling user activation:', error)
    return { success: false, error: 'Không thể cập nhật trạng thái người dùng.' }
  }
}

export async function getUsers() {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isActive || !user.role || (user.role !== 'OWNER' && user.role !== 'MANAGER')) {
      return { success: false, error: 'Không có quyền truy cập.' }
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      }
    })
    return { success: true, data: users }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Không thể tải danh sách người dùng.' }
  }
}
