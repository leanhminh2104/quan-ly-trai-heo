'use client'
// Bản quyền thuộc dalymmo.com


import { Bell, Moon, Sun, Menu, Search, ChevronDown, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeSwitch } from '@/components/ui/theme-switch'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDashboardAlerts } from '@/hooks/use-dashboard'
import { format } from 'date-fns'

interface HeaderProps {
  onMenuClick: () => void
  sidebarCollapsed: boolean
  user?: {
    name: string
    email: string
    role: any
    avatar: string | null
  }
}

const ROLE_TRANSLATIONS: Record<string, string> = {
  OWNER: 'Chủ trại',
  MANAGER: 'Quản lý',
  WORKER: 'Nhân viên',
  VETERINARIAN: 'Bác sĩ thú y',
  VIEWER: 'Người xem',
}

export function Header({ onMenuClick, sidebarCollapsed, user }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  const { data: alerts } = useDashboardAlerts()
  const unreadCount = alerts?.filter(a => !a.isRead).length || 0

  const [searchQuery, setSearchQuery] = useState('')
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    // Simple search redirect logic based on prefix
    if (searchQuery.toLowerCase().startsWith('c')) {
      router.push(`/barns?q=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(`/pigs?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const isDark = theme === 'dark' || resolvedTheme === 'dark'

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6 transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[260px]'
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="mr-3 lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã lợn (Heo...), mã chuồng (C...)"
            className="w-full h-9 rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
          />
        </form>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger 
            className="relative p-2 rounded-lg hover:bg-accent transition-colors outline-none"
            aria-label="Thông báo"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Thông báo ({unreadCount})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {alerts && alerts.length > 0 ? (
                  alerts.map((alert: any) => (
                    <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="flex justify-between items-center w-full mb-1">
                        <span className="font-semibold text-sm">{alert.title}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(alert.createdAt), 'HH:mm dd/MM')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">{alert.message}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">Không có thông báo mới</div>
                )}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-emerald-600 font-medium">
              Xem tất cả
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <div className="flex items-center ml-2 mr-2">
          <ThemeSwitch 
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors outline-none">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover shadow" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user?.role ? ROLE_TRANSLATIONS[user.role] || user.role : 'Chủ trại'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings/farm')}>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
