'use client'
// Bản quyền thuộc dalymmo.com


import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AppSidebar, MobileNav } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { UserRole } from '@prisma/client'

export default function DashboardLayoutClient({
  children,
  userRole,
  userPermissions = [],
  user,
}: {
  children: React.ReactNode
  userRole?: UserRole
  userPermissions?: string[]
  user?: {
    name: string
    email: string
    role: UserRole | null
    avatar: string | null
  }
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          userRole={userRole}
          userPermissions={userPermissions}
        />
      </div>

      {/* Mobile navigation */}
      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        userRole={userRole}
        userPermissions={userPermissions}
      />

      {/* Header */}
      <Header
        onMenuClick={() => setMobileNavOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        user={user}
      />

      {/* Main content */}
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] p-4 lg:p-6 transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}
