// Bản quyền thuộc dalymmo.com
'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'

// Check if role is allowed to be set by current role
function canManageRole(currentRole: UserRole, targetRole: UserRole): boolean {
  if (currentRole === 'OWNER') return true
  if (currentRole === 'MANAGER') {
    // MANAGER cannot assign OWNER or MANAGER roles
    return targetRole !== 'OWNER' && targetRole !== 'MANAGER'
  }
  return false
}

export async function getUsersAndRoles() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.farmId) {
      return { success: false, error: 'Chưa đăng nhập hoặc không có trang trại' }
    }

    if (currentUser.role !== 'OWNER' && currentUser.role !== 'MANAGER') {
      return { success: false, error: 'Bạn không có quyền xem thông tin này' }
    }

    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Get all farm members for this farm
    const members = await prisma.farmMember.findMany({
      where: { farmId: currentUser.farmId }
    })

    const memberMap = new Map(members.map(m => [m.userId, m]))

    const data = users.map(user => {
      const member = memberMap.get(user.id)
      return {
        id: user.id,
        memberId: member?.id || null,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role: member?.role || null,
        createdAt: user.createdAt,
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching users and roles:', error)
    return { success: false, error: 'Không thể tải danh sách tài khoản.' }
  }
}

export async function updateMemberRole(memberId: string, newRole: UserRole) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.farmId) {
      return { success: false, error: 'Chưa đăng nhập hoặc không có trang trại' }
    }

    if (!canManageRole(currentUser.role as UserRole, newRole)) {
      return { success: false, error: 'Bạn không có quyền gán vai trò này' }
    }

    // Lấy thông tin member cần sửa
    const targetMember = await prisma.farmMember.findUnique({
      where: { id: memberId },
    })

    if (!targetMember || targetMember.farmId !== currentUser.farmId) {
      return { success: false, error: 'Thành viên không tồn tại hoặc không thuộc trang trại này' }
    }
    
    // Nếu thay đổi quyền của OWNER khác, chỉ OWNER mới được làm
    if (targetMember.role === 'OWNER' && currentUser.role !== 'OWNER') {
      return { success: false, error: 'Bạn không có quyền thay đổi vai trò của Chủ trang trại' }
    }

    // Không cho phép tự đổi quyền của mình (để tránh mất quyền Admin)
    if (targetMember.userId === currentUser.id) {
      return { success: false, error: 'Bạn không thể tự thay đổi vai trò của chính mình' }
    }

    await prisma.farmMember.update({
      where: { id: memberId },
      data: { role: newRole },
    })

    revalidatePath('/settings/roles')
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: 'Không thể cập nhật vai trò.' }
  }
}
