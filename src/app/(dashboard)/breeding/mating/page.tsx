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
import { Edit, Search, Plus, CalendarDays } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime, formatDate } from '@/lib/utils'
import { BREEDING_STATUS_LABELS } from '@/lib/constants'

import { MatingModal } from '@/components/breeding/mating-modal'

export default function MatingPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BreedingStatus | undefined>()

  const { data, isLoading } = useMatings({
    page,
    pageSize: 10,
    search: search || undefined,
    status,
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
      id: 'boar',
      header: 'Đực giống / Tinh',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.boar?.code || (row.original.semenStockId ? 'Tinh nhân tạo' : 'Không rõ')}
        </span>
      ),
    },
    {
      accessorKey: 'matingNumber',
      header: 'Lần phối',
      cell: ({ row }) => <span className="text-sm text-center block w-full">{row.original.matingNumber}</span>,
    },
    {
      accessorKey: 'technician',
      header: 'Người phối',
      cell: ({ row }) => <span className="text-sm">{row.original.technician || 'N/A'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.original.status
        const isMated = s === 'MATED'
        const isPregnant = s === 'PREGNANT'
        const isFailed = s === 'NOT_PREGNANT' || s === 'ABORTED' || s === 'CANCELLED'

        const badgeClass = isPregnant 
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          : isFailed 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : isMated
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

        return (
          <Badge variant="outline" className={`${badgeClass} border-0 font-medium`}>
            {BREEDING_STATUS_LABELS[s] || s}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'expectedUltrasoundDate',
      header: 'Dự kiến siêu âm',
      cell: ({ row }) => (
        <span className="text-sm flex items-center gap-1">
          <CalendarDays className="w-3 h-3 text-muted-foreground" />
          {row.original.expectedUltrasoundDate ? formatDate(row.original.expectedUltrasoundDate) : 'N/A'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quản lý Phối giống"
          description="Theo dõi lịch sử phối giống, ngày dự kiến siêu âm và đẻ"
        />
        <MatingModal />
      </div>

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
              {Object.entries(BREEDING_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
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
        emptyTitle="Chưa có phiếu phối giống"
        emptyDescription="Danh sách phối giống trống hoặc không khớp với bộ lọc."
      />
    </div>
  )
}
