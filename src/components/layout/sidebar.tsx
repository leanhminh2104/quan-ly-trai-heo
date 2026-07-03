'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Warehouse,
  PiggyBank,
  Heart,
  Stethoscope,
  Package,
  DollarSign,
  Users,
  ClipboardList,
  BarChart3,
  ScrollText,
  Settings,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { UserRole } from '@prisma/client'

// Icon map
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Warehouse,
  PiggyBank,
  Heart,
  Stethoscope,
  Package,
  DollarSign,
  Users,
  ClipboardList,
  BarChart3,
  ScrollText,
  Settings,
}

const routePermissionMap: Record<string, string> = {
  '/dashboard': 'dashboard:view',
  '/barns': 'barn:view',
  '/pigs': 'pig:view',
  '/breeding': 'breeding:view',
  '/health': 'health:view',
  '/inventory': 'inventory:view',
  '/finance': 'finance:view',
  '/employees': 'employee:view',
  '/tasks': 'task:view',
  '/reports': 'report:view',
  '/audit-log': 'audit:view',
  '/settings': 'settings:view',
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  className?: string
  userRole?: UserRole
  userPermissions?: string[]
}

export function AppSidebar({ collapsed, onToggle, className, userRole = 'VIEWER', userPermissions = [] }: AppSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  // Lọc menu theo quyền
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (userRole === 'OWNER') return true;
    const permission = routePermissionMap[item.href] || 'dashboard:view';
    return userPermissions.includes(permission);
  })

  const toggleExpand = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg">
            🐷
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-700 dark:from-emerald-400 dark:to-green-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
              >
                PFMS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={onToggle}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label={collapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const active = isActive(item.href)
            const hasChildren = 'children' in item && item.children
            const isExpanded = expandedItems.includes(item.href)

            return (
              <li key={item.href}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => {
                        if (collapsed) return
                        toggleExpand(item.href)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        collapsed && 'justify-center px-0'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      {Icon && (
                        <Icon className={cn('h-5 w-5 shrink-0', active && 'text-emerald-600 dark:text-emerald-400')} />
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>
                    <AnimatePresence>
                      {!collapsed && isExpanded && hasChildren && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-4 mt-1 space-y-0.5 border-l-2 border-border pl-3"
                        >
                          {item.children.map((child) => {
                            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'block rounded-md px-3 py-2 text-sm transition-colors',
                                    childActive
                                      ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-950/50 dark:text-emerald-400'
                                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                  )}
                                >
                                  {child.title}
                                </Link>
                              </li>
                            )
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {Icon && (
                      <Icon className={cn('h-5 w-5 shrink-0', active && 'text-emerald-600 dark:text-emerald-400')} />
                    )}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground text-center">
            PFMS v1.0 © {new Date().getFullYear()}<br/>
            Bản quyền thuộc dalymmo.com
          </p>
        )}
      </div>
    </aside>
  )
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  userRole?: UserRole
  userPermissions?: string[]
}

export function MobileNav({ open, onClose, userRole = 'VIEWER', userPermissions = [] }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute right-2 top-4 z-10 p-1 rounded-md hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
              <AppSidebar collapsed={false} onToggle={onClose} userRole={userRole} userPermissions={userPermissions} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
