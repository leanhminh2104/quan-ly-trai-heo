'use client'
// Bản quyền thuộc dalymmo.com

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Store, Settings, Tags, Ruler, Users, Shield, Key } from 'lucide-react'
import { UserRole } from '@prisma/client'

import { hasPermission } from '@/lib/rbac'

const SETTINGS_NAV = [
  {
    title: 'Trang trại',
    href: '/settings/farm',
    icon: Store,
    permission: 'farm:update',
  },
  {
    title: 'Danh mục',
    href: '/settings/categories',
    icon: Tags,
    permission: 'settings:categories',
  },
  {
    title: 'Đơn vị tính',
    href: '/settings/units',
    icon: Ruler,
    permission: 'settings:categories',
  },
  {
    title: 'Tài khoản & Phân quyền',
    href: '/settings/roles',
    icon: Users,
    permission: 'farm:members',
  },
  {
    title: 'Xác thực & Bảo mật',
    href: '/settings/security',
    icon: Shield,
    permission: 'settings:view',
  },
]

interface SettingsSidebarProps {
  userRole?: string
  userPermissions?: string[]
}

export function SettingsSidebar({ userRole = 'VIEWER', userPermissions = [] }: SettingsSidebarProps) {
  const pathname = usePathname()

  const visibleNav = SETTINGS_NAV.filter(item => {
    if (userRole === 'OWNER') return true
    return userPermissions.includes(item.permission)
  })

  return (
    <nav className="flex flex-col space-y-1">
      {visibleNav.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
