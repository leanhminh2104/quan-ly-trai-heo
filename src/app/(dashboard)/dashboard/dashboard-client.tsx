'use client'
// Bản quyền thuộc dalymmo.com

import React from 'react'
import {
  PiggyBank,
  Warehouse,
  Heart,
  Pill,
  Syringe,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar
} from 'lucide-react'
import { FinancialChart } from '@/components/reports/financial-chart'
import { PopulationChart } from '@/components/reports/population-chart'
import { useDashboardStats, useDashboardAlerts, useUpcomingTasks, useDashboardRecentActivities } from '@/hooks/use-dashboard'
import { format } from 'date-fns'

// Stat card component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  color: string
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-800',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-800',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800',
    red: 'from-red-500/10 to-red-600/5 border-red-200 dark:border-red-800',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-200 dark:border-cyan-800',
    pink: 'from-pink-500/10 to-pink-600/5 border-pink-200 dark:border-pink-800',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-200 dark:border-yellow-800',
  }

  const iconColorClasses: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-400',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/50 dark:text-purple-400',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-400',
    red: 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400',
    cyan: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/50 dark:text-cyan-400',
    pink: 'text-pink-600 bg-pink-100 dark:bg-pink-900/50 dark:text-pink-400',
    yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400',
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorClasses[color]} p-5 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1 text-xs">
              {changeType === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {changeType === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={
                changeType === 'up' ? 'text-emerald-600' :
                changeType === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${iconColorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function AlertItem({
  title,
  description,
  type,
}: {
  title: string
  description: string
  type: string
}) {
  const typeClasses: Record<string, string> = {
    WARNING: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
    DANGER: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
    INFO: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
    SUCCESS: 'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  }
  
  const iconColor: Record<string, string> = {
    WARNING: 'text-yellow-600',
    DANGER: 'text-red-600',
    INFO: 'text-blue-600',
    SUCCESS: 'text-emerald-600',
  }

  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${typeClasses[type] || typeClasses['INFO']}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor[type] || iconColor['INFO']}`} />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  )
}

function formatCurrencyUnit(value: number) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toString()
}

export function DashboardClient() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: alerts } = useDashboardAlerts()
  const { data: tasks } = useUpcomingTasks()
  const { data: recentActivities } = useDashboardRecentActivities()

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground">Đang tải dữ liệu mới nhất...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 h-[104px] animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-muted w-1/2 rounded"></div>
                  <div className="h-6 bg-muted w-3/4 rounded"></div>
                </div>
                <div className="h-10 w-10 bg-muted rounded-lg shrink-0"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card h-[460px] animate-pulse"></div>
          <div className="rounded-xl border bg-card h-[460px] animate-pulse"></div>
        </div>
      </div>
    )
  }

  const s = stats || {}

  // Calculate changes (basic placeholder logic for UI demonstration, can be enhanced)
  const revenueChange = s.revenueThisMonth - s.revenueLastMonth
  const expenseChange = s.expenseThisMonth - s.expenseLastMonth
  const revenueChangePct = s.revenueLastMonth ? Math.round((revenueChange / s.revenueLastMonth) * 100) : 0
  const expenseChangePct = s.expenseLastMonth ? Math.round((expenseChange / s.expenseLastMonth) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground">
          Chào mừng bạn quay lại! Dưới đây là tình hình trại hôm nay.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng đàn"
          value={s.totalPigs || 0}
          change="Đang nuôi"
          changeType="neutral"
          icon={PiggyBank}
          color="emerald"
        />
        <StatCard
          title="Lợn nái"
          value={s.totalSows || 0}
          change={`${s.farrowingSows || 0} sắp đẻ (7 ngày)`}
          changeType="neutral"
          icon={Heart}
          color="pink"
        />
        <StatCard
          title="Chuồng trống"
          value={s.emptyBarns || 0}
          change={`/ ${s.totalBarns || 0} chuồng`}
          changeType="neutral"
          icon={Warehouse}
          color="blue"
        />
        <StatCard
          title="Doanh thu tháng"
          value={formatCurrencyUnit(s.revenueThisMonth || 0)}
          change={`${revenueChangePct > 0 ? '+' : ''}${revenueChangePct}% so tháng trước`}
          changeType={revenueChangePct > 0 ? 'up' : revenueChangePct < 0 ? 'down' : 'neutral'}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Second row stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Đang điều trị"
          value={s.treatingPigs || 0}
          change="Đang cách ly"
          changeType="neutral"
          icon={Pill}
          color="orange"
        />
        <StatCard
          title="Sắp đẻ (7 ngày)"
          value={s.farrowingSows || 0}
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Cần tiêm phòng"
          value={s.pendingVaccines || 0}
          change="Trong 7 ngày tới"
          changeType="neutral"
          icon={Syringe}
          color="cyan"
        />
        <StatCard
          title="Chi phí tháng"
          value={formatCurrencyUnit(s.expenseThisMonth || 0)}
          change={`${expenseChangePct > 0 ? '+' : ''}${expenseChangePct}% so tháng trước`}
          changeType={expenseChangePct > 0 ? 'up' : expenseChangePct < 0 ? 'down' : 'neutral'}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Charts and alerts row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <PopulationChart />
        </div>

        {/* Alerts */}
        <div className="rounded-xl border bg-card p-6 h-[460px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">⚠️ Cảnh báo</h3>
          <div className="space-y-3">
            {alerts && alerts.length > 0 ? (
              alerts.map((alert: any) => (
                <AlertItem
                  key={alert.id}
                  title={alert.title}
                  description={alert.message}
                  type={alert.type || 'INFO'}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Không có cảnh báo mới.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions and schedule row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <FinancialChart />
        </div>

        {/* Upcoming schedule and Recent activities */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">📅 Lịch sắp tới</h3>
            <div className="space-y-3">
              {tasks && tasks.length > 0 ? (
                tasks.map((task: any, index: number) => {
                  const colors = ['purple', 'pink', 'cyan', 'emerald', 'blue']
                  const c = colors[index % colors.length]
                  return (
                    <div key={task.id} className={`flex items-center gap-3 rounded-lg bg-${c}-50 dark:bg-${c}-950/20 p-3 border`}>
                      <Calendar className={`h-4 w-4 text-${c}-500 shrink-0`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(task.dueDate), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có lịch trình sắp tới.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">🕒 Hoạt động gần đây</h3>
            <div className="space-y-3">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-3 border-b pb-2 last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {activity.user?.name ? activity.user.name.charAt(0) : 'S'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{activity.action} {activity.entity}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), 'dd/MM/yyyy HH:mm')} - {activity.user?.name || 'Hệ thống'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
