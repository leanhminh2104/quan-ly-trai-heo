'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useMatings } from '@/hooks/use-breeding'
import { MatingWithDetails } from '@/types/breeding'
import { BreedingStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Search, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime, formatDate } from '@/lib/utils'
import { BREEDING_STATUS_LABELS } from '@/lib/constants'

import { UltrasoundModal } from '@/components/breeding/ultrasound-modal'

export default function PregnancyPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BreedingStatus | undefined>()
  const [selectedMatingId, setSelectedMatingId] = useState<string | null>(null)

  const { data, isLoading } = useMatings({
    page,
    pageSize: 10,
    search: search || undefined,
    status, // Lọc trạng thái (MATED, PREGNANT)
  })

  const columns: ColumnDef<MatingWithDetails>[] = [
    {
      id: 'sow',
      header: 'Mã nái',
      cell: ({ row }) => (
        <span className="font-semibold text-pink-700 dark:text-pink-400">
          {row.original.sow?.code || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'matingDate',
      header: 'Ngày phối',
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{formatDate(row.original.matingDate)}</span>
          <span className="text-xs text-muted-foreground">{row.original.daysSinceMating} ngày trước</span>
        </div>
      ),
    },
    {
      accessorKey: 'expectedUltrasoundDate',
      header: 'Dự kiến siêu âm',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.expectedUltrasoundDate ? formatDate(row.original.expectedUltrasoundDate) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'ultrasoundResult',
      header: 'Kết quả siêu âm',
      cell: ({ row }) => {
        const res = row.original.ultrasoundResult
        if (!res) return <span className="text-muted-foreground text-sm">Chưa có kết quả</span>
        const isPos = res === 'POSITIVE'
        return (
          <Badge variant={isPos ? 'default' : 'destructive'} className={isPos ? 'bg-emerald-500' : ''}>
            {isPos ? 'Đậu thai' : (res === 'NEGATIVE' ? 'Không đậu' : 'Chưa rõ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.original.status
        const isPregnant = s === 'PREGNANT'
        const badgeClass = isPregnant 
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'

        return (
          <Badge variant="outline" className={`${badgeClass} border-0 font-medium`}>
            {BREEDING_STATUS_LABELS[s] || s}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'expectedFarrowingDate',
      header: 'Dự kiến đẻ',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
          {row.original.expectedFarrowingDate ? formatDate(row.original.expectedFarrowingDate) : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50" 
            title="Cập nhật siêu âm"
            onClick={() => setSelectedMatingId(row.original.id)}
          >
            <Activity className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Mang thai & Siêu âm"
        description="Cập nhật kết quả siêu âm và theo dõi quá trình mang thai của nái"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã nái..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={status || 'all'} onValueChange={(val) => setStatus(val === 'all' ? undefined : val as BreedingStatus)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="MATED">Chờ siêu âm</SelectItem>
              <SelectItem value="PREGNANT">Đang mang thai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        pageCount={data?.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="Chưa có dữ liệu mang thai"
        emptyDescription="Danh sách nái mang thai trống hoặc không khớp với bộ lọc."
      />

      {selectedMatingId && (
        <UltrasoundModal 
          matingId={selectedMatingId} 
          open={true} 
          onOpenChange={(open) => !open && setSelectedMatingId(null)} 
        />
      )}
    </div>
  )
}
