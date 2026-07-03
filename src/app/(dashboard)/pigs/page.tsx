'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { usePigs, useDeletePig } from '@/hooks/use-pig'
import { PigWithDetails } from '@/types/pig'
import { PigType, PigStatus, PigGender } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { PIG_TYPE_LABELS, PIG_STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

export default function PigsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<PigType | undefined>()
  const [status, setStatus] = useState<PigStatus | undefined>()
  const [gender, setGender] = useState<PigGender | undefined>()

  const { data, isLoading } = usePigs({
    page,
    pageSize: 10,
    search: search || undefined,
    type,
    status,
    gender,
    sortBy: 'earTag',
    sortOrder: 'asc',
  })

  const { mutate: deletePig, isPending: isDeleting } = useDeletePig()

  const columns: ColumnDef<PigWithDetails>[] = [
    {
      accessorKey: 'code',
      header: 'Thẻ tai / Mã',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{row.original.earTag || row.original.code}</span>
          {row.original.earTag && <span className="text-xs text-muted-foreground">Mã HT: {row.original.code}</span>}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const t = row.original.type
        return (
          <Badge variant="outline" className="font-normal bg-accent">
            {PIG_TYPE_LABELS[t] || t}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'gender',
      header: 'Giới tính',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.gender === 'MALE' ? 'Đực' : 'Cái'}
        </span>
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
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/pigs/${row.original.id}/edit`)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa lợn mã ${row.original.code}? Hành động này sẽ chuyển trạng thái lợn thành "Chết" hoặc "Không hoạt động".`)) {
                deletePig(row.original.id)
              }
            }}
            disabled={isDeleting}
            title="Xóa cá thể"
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
        title="Tất cả đàn lợn"
        description="Quản lý toàn bộ thông tin cá thể lợn trong trang trại"
        action={{
          label: 'Nhập đàn mới',
          href: '/pigs/new',
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
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
          <Select value={type || 'all'} onValueChange={(val) => setType(val === 'all' ? undefined : val as PigType)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Loại lợn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {Object.entries(PIG_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status || 'all'} onValueChange={(val) => setStatus(val === 'all' ? undefined : val as PigStatus)}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(PIG_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={gender || 'all'} onValueChange={(val) => setGender(val === 'all' ? undefined : val as PigGender)}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giới</SelectItem>
              <SelectItem value="MALE">Đực</SelectItem>
              <SelectItem value="FEMALE">Cái</SelectItem>
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
        emptyTitle="Không tìm thấy cá thể nào"
        emptyDescription="Bạn chưa nhập đàn hoặc không có lợn nào khớp với bộ lọc."
      />
    </div>
  )
}
