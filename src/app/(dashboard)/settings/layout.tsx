// Bản quyền thuộc dalymmo.com
import { Metadata } from 'next'
import { SettingsSidebar } from '@/components/settings/settings-sidebar'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasPermission } from '@/lib/rbac'

export const metadata: Metadata = {
  title: 'Cài đặt | Quản lý Trại Lợn Thông Minh',
  description: 'Cấu hình và cài đặt hệ thống',
}

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const { getRolePermissionsAsync } = await import('@/lib/rbac')
  const userPermissions = await getRolePermissionsAsync(user.role as any, user.farmId || undefined)

  if (user.role !== 'OWNER' && !userPermissions.includes('settings:view')) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SettingsSidebar userRole={user.role || 'VIEWER'} userPermissions={userPermissions} />
        </aside>
        <div className="flex-1 lg:max-w-4xl">{children}</div>
      </div>
    </div>
  )
}
