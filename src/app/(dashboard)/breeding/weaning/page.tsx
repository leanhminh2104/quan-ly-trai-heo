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
import { Search, Edit, UserMinus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { BREEDING_STATUS_LABELS } from '@/lib/constants'

export default function WeaningPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BreedingStatus | undefined>()

  const { data, isLoading } = useMatings({
    page,
    pageSize: 10,
    search: search || undefined,
    status, // Lọc trạng thái FARROWED hoặc WEANED
  })

  // Chỉ hiển thị các lứa đã đẻ
  const filteredItems = (data?.items || []).filter(item => 
    ['FARROWED', 'WEANED'].includes(item.status)
  )

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
      id: 'farrowingDate',
      header: 'Ngày đẻ',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.farrowing?.farrowingDate ? formatDate(row.original.farrowing.farrowingDate) : 'N/A'}
        </span>
      ),
    },
    {
      id: 'pigletsCount',
      header: 'Số con đang nuôi',
      cell: ({ row }) => {
        const f = row.original.farrowing
        if (!f) return <span className="text-muted-foreground text-sm">--</span>
        return <span className="font-medium text-emerald-600">{f.bornAlive} con</span>
      },
    },
    {
      accessorKey: 'expectedWeaningDate',
      header: 'Dự kiến cai sữa',
      cell: ({ row }) => (
        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          {row.original.expectedWeaningDate ? formatDate(row.original.expectedWeaningDate) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.original.status
        const isWeaned = s === 'WEANED'
        const badgeClass = isWeaned
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'

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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/50" title="Cai sữa">
            <UserMinus className="h-4 w-4" />
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
        title="Quản lý cai sữa"
        description="Theo dõi đàn lợn con theo mẹ và thực hiện cai sữa"
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
              <SelectItem value="FARROWED">Đang nuôi con</SelectItem>
              <SelectItem value="WEANED">Đã cai sữa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        page={page}
        pageCount={data?.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="Chưa có dữ liệu"
        emptyDescription="Không có nái nào đang nuôi con hoặc đã cai sữa."
      />
    </div>
  )
}
