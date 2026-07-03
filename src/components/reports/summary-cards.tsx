'use client'
// Bản quyền thuộc dalymmo.com

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PiggyBank, Users, Tent, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react'
import { useSummaryStats } from '@/hooks/use-report'

export function SummaryCards() {
  const { data: stats, isLoading } = useSummaryStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-14"></CardHeader>
            <CardContent className="h-10"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số lợn</CardTitle>
          <PiggyBank className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalPigs || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Đang nuôi tại trang trại
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chuồng hoạt động</CardTitle>
          <Tent className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeBarns || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Số lượng chuồng đang dùng
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Việc chờ xử lý</CardTitle>
          <ClipboardList className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.pendingTasks || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cần được hoàn thành
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tài chính (Tháng này)</CardTitle>
          {stats && stats.revenueThisMonth >= stats.expenseThisMonth ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(stats?.revenueThisMonth || 0)}
          </div>
          <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
            -{formatCurrency(stats?.expenseThisMonth || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
