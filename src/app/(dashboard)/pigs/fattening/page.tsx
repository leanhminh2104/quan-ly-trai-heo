'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { usePigs, useDeletePig } from '@/hooks/use-pig'
import { PigWithDetails } from '@/types/pig'
import { PigStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Search, Plus, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { PIG_STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export default function FatteningPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PigStatus | undefined>()

  const { data, isLoading } = usePigs({
    page,
    pageSize: 10,
    search: search || undefined,
    type: 'FATTENING',
    status,
  })

  const { mutate: deletePig, isPending: isDeleting } = useDeletePig()

  const columns: ColumnDef<PigWithDetails>[] = [
    {
      accessorKey: 'code',
      header: 'Mã lợn / Lô',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-orange-700 dark:text-orange-400">{row.original.earTag || row.original.code}</span>
          {row.original.earTag && <span className="text-xs text-muted-foreground">Mã HT: {row.original.code}</span>}
        </div>
      ),
    },
    {
      id: 'pen',
      header: 'Vị trí (Chuồng)',
      cell: ({ row }) => {
        const pen = row.original.pen
        if (!pen) return <span className="text-muted-foreground text-sm">Chưa xếp</span>
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{pen.name}</span>
            <span className="text-xs text-muted-foreground">{pen.barn?.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const s = row.original.status
        const colors = STATUS_COLORS[s] || { bg: 'bg-gray-100', text: 'text-gray-800' }
        return (
          <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 font-medium`}>
            {PIG_STATUS_LABELS[s] || s}
          </Badge>
        )
      },
    },
    {
      id: 'age',
      header: 'Ngày tuổi',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.ageInDays ? `${row.original.ageInDays} ngày` : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'currentWeight',
      header: 'Trọng lượng',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.currentWeight ? `${row.original.currentWeight} kg` : '--'}
        </span>
      ),
    },
    {
      accessorKey: 'importSource',
      header: 'Nguồn gốc',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.importSource || '--'}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Ghi chú',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]" title={row.original.notes || ''}>
          {row.original.notes || '--'}
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
            className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/50" 
            title="Xuất bán"
            onClick={() => alert('Tính năng Xuất bán đang được xây dựng')}
          >
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            onClick={() => router.push(`/pigs/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa mã ${row.original.code}?`)) {
                deletePig(row.original.id)
              }
            }}
            disabled={isDeleting}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Quản lý lợn thịt"
        description="Theo dõi đàn lợn thịt, ngày tuổi và trọng lượng xuất chuồng"
        action={{
          label: 'Nhập lợn thịt',
          href: '/pigs/new?type=FATTENING',
          icon: <Plus className="w-4 h-4 mr-2" />
        }}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã lợn, tên, thẻ tai..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={status || 'all'} onValueChange={(val) => setStatus(val === 'all' ? undefined : val as PigStatus)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang nuôi</SelectItem>
              <SelectItem value="TREATMENT">Đang điều trị</SelectItem>
              <SelectItem value="SOLD">Đã bán</SelectItem>
              <SelectItem value="DEAD">Chết</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        pageCount={data?.totalPages || 1}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/pigs/${row.id}`)}
        emptyTitle="Không tìm thấy lợn thịt"
        emptyDescription="Chưa có dữ liệu lợn thịt hoặc không khớp với bộ lọc."
      />
    </div>
  )
}
