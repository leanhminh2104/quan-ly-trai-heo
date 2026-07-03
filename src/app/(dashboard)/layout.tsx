// Bản quyền thuộc dalymmo.com
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from './dashboard-layout-client'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user;
  try {
    user = await getCurrentUser()
  } catch (error: any) {
    if (error.message === 'Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.') {
      redirect('/pending-approval')
    }
    throw error
  }

  if (!user) {
    redirect('/login')
  }

  if (!user.isActive) {
    redirect('/pending-approval')
  }

  const { prisma } = await import('@/lib/prisma')
  const maintenanceParam = await prisma.systemParameter.findUnique({
    where: {
      farmId_key: {
        farmId: user.farmId || '',
        key: 'MAINTENANCE_MODE'
      }
    }
  })

  if (maintenanceParam?.value === 'true' && user.role !== 'OWNER') {
    redirect('/maintenance')
  }

  const { getRolePermissionsAsync } = await import('@/lib/rbac')
  const { UserRole } = await import('@prisma/client')
  const userPermissions = await getRolePermissionsAsync(user.role as typeof UserRole[keyof typeof UserRole], user.farmId || undefined)

  return (
    <DashboardLayoutClient 
      userRole={user.role || 'VIEWER'} 
      userPermissions={userPermissions}
      user={{
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }}
    >
      {children}
    </DashboardLayoutClient>
  )
}
