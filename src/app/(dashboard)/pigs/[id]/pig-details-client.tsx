'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PigWithDetails } from '@/types/pig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Calendar, Weight, Info, Activity, History } from 'lucide-react'
import { formatDateTime, formatDate } from '@/lib/utils'
import { PIG_TYPE_LABELS, PIG_STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export default function PigDetailsClient({ initialData }: { initialData: PigWithDetails }) {
  const router = useRouter()
  const pig = initialData
  const statusColors = STATUS_COLORS[pig.status] || { bg: 'bg-gray-100', text: 'text-gray-800' }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{pig.code}</h2>
              <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text} border-0`}>
                {PIG_STATUS_LABELS[pig.status] || pig.status}
              </Badge>
              <Badge variant="secondary">
                {PIG_TYPE_LABELS[pig.type] || pig.type} ({pig.gender === 'MALE' ? 'Đực' : 'Cái'})
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <span>Thẻ tai: {pig.earTag || 'N/A'}</span>
              <span>•</span>
              <span>Vị trí: {pig.pen?.name || 'Chưa xếp'} ({pig.pen?.barn?.name || ''})</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Lịch sử
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Edit className="w-4 h-4 mr-2" />
            Sửa thông tin
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="health">Sức khỏe</TabsTrigger>
          {['SOW', 'BOAR'].includes(pig.type) && (
            <TabsTrigger value="breeding">Sinh sản</TabsTrigger>
          )}
          <TabsTrigger value="history">Nhật ký</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ngày tuổi</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pig.ageInDays ? `${pig.ageInDays} ngày` : 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sinh: {pig.birthDate ? formatDate(pig.birthDate) : 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trọng lượng</CardTitle>
                <Weight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pig.currentWeight ? `${pig.currentWeight} kg` : 'N/A'}</div>
                <p className="text-xs text-muted-foreground mt-1">Cập nhật lúc nhập đàn</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Phả hệ</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>Mẹ: <span className="font-medium text-pink-600">{pig.motherId || 'N/A'}</span></p>
                  <p>Cha: <span className="font-medium text-indigo-600">{pig.fatherId || 'N/A'}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div className="flex flex-col gap-1 border-b pb-2">
                  <dt className="text-muted-foreground">Giống</dt>
                  <dd className="font-medium">{pig.breed?.name || 'Lai'}</dd>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <dt className="text-muted-foreground">Màu sơn đánh dấu</dt>
                  <dd className="font-medium">
                    {pig.markerColor ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: pig.markerColor }}></span>
                        {pig.markerColor}
                      </span>
                    ) : 'Không có'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <dt className="text-muted-foreground">Ngày nhập đàn</dt>
                  <dd className="font-medium">{pig.importDate ? formatDate(pig.importDate) : 'N/A'}</dd>
                </div>
                <div className="flex flex-col gap-1 border-b pb-2">
                  <dt className="text-muted-foreground">Nguồn gốc nhập</dt>
                  <dd className="font-medium">{pig.importSource || 'N/A'}</dd>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2 border-b pb-2">
                  <dt className="text-muted-foreground">Ghi chú</dt>
                  <dd className="font-medium whitespace-pre-wrap">{pig.notes || 'Không có ghi chú'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử y tế & Tiêm phòng</CardTitle>
              <CardDescription>Các hoạt động thú y đã thực hiện trên cá thể này.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <History className="w-12 h-12 mb-4 opacity-50" />
              <p>Chưa có dữ liệu tiêm phòng hoặc điều trị.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {['SOW', 'BOAR'].includes(pig.type) && (
          <TabsContent value="breeding">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử sinh sản</CardTitle>
                <CardDescription>Chi tiết các lứa đẻ hoặc số lần khai thác tinh.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p>Chưa có dữ liệu sinh sản.</p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Nhật ký hoạt động</CardTitle>
              <CardDescription>Lịch sử các sự kiện liên quan đến lợn.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-3 space-y-6">
                <div className="relative pl-6">
                  <span className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-background"></span>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Hệ thống tạo tự động</span>
                    <span className="text-sm text-muted-foreground">Tạo cá thể lợn mã {pig.code}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(pig.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
