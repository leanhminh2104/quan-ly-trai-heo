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
import { Search, Edit, Baby } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { BREEDING_STATUS_LABELS } from '@/lib/constants'

import { FarrowingModal } from '@/components/breeding/farrowing-modal'

export default function FarrowingPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BreedingStatus | undefined>()
  const [selectedMatingId, setSelectedMatingId] = useState<string | null>(null)

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
      accessorKey: 'expectedFarrowingDate',
      header: 'Dự kiến đẻ',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.expectedFarrowingDate ? formatDate(row.original.expectedFarrowingDate) : 'N/A'}
        </span>
      ),
    },
    {
      id: 'farrowingDate',
      header: 'Ngày đẻ thực tế',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
          {row.original.farrowing?.farrowingDate ? formatDate(row.original.farrowing.farrowingDate) : 'Chưa đẻ'}
        </span>
      ),
    },
    {
      id: 'results',
      header: 'Kết quả đẻ',
      cell: ({ row }) => {
        const f = row.original.farrowing
        if (!f) return <span className="text-muted-foreground text-sm">Chưa có kết quả</span>
        return (
          <div className="flex gap-2 text-xs">
            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Sống: {f.bornAlive}</span>
            {(f.bornDead > 0) && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Chết: {f.bornDead}</span>}
            {(f.mummified > 0) && <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Khô: {f.mummified}</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.original.status
        const isPregnant = s === 'PREGNANT'
        const isFarrowed = s === 'FARROWED'
        const badgeClass = isFarrowed
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : isPregnant
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'

        return (
          <Badge variant="outline" className={`${badgeClass} border-0 font-medium`}>
            {BREEDING_STATUS_LABELS[s] || s}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/50" 
            title="Báo đẻ"
            onClick={() => setSelectedMatingId(row.original.id)}
          >
            <Baby className="h-4 w-4" />
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
        title="Quản lý đẻ"
        description="Theo dõi lịch đẻ dự kiến và ghi nhận kết quả đẻ của nái"
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
              <SelectItem value="PREGNANT">Sắp đẻ</SelectItem>
              <SelectItem value="FARROWED">Đã đẻ</SelectItem>
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
        emptyTitle="Chưa có dữ liệu"
        emptyDescription="Không có nái nào sắp đẻ hoặc đã đẻ khớp với bộ lọc."
      />

      {selectedMatingId && (
        <FarrowingModal 
          matingId={selectedMatingId} 
          open={true} 
          onOpenChange={(open) => !open && setSelectedMatingId(null)} 
        />
      )}
    </div>
  )
}
