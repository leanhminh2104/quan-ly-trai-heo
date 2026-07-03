'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialStats } from '@/hooks/use-report'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function FinancialChart() {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const { data, isLoading } = useFinancialStats(year)

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle>Báo cáo Tài chính</CardTitle>
          <CardDescription>Biến động doanh thu và chi phí trong năm</CardDescription>
        </div>
        <Select value={year.toString()} onValueChange={(v) => { if (v) setYear(parseInt(v)) }}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Chọn năm" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>Năm {y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(val) => val.split('/')[0]} // Chỉ hiển thị tháng
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888888' }}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888888' }}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatTooltip(Number(value) || 0), name === 'income' ? 'Tổng Thu' : 'Tổng Chi']}
                  labelFormatter={(label) => `Tháng ${label}`}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="Tổng Thu" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Tổng Chi" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
