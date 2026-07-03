'use client'
// Bản quyền thuộc dalymmo.com


import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useBarns, useDeleteBarn } from '@/hooks/use-barn'
import { PenWithDetails, PEN_TYPE_LABELS, PEN_STATUS_LABELS, PEN_STATUS_COLORS, PEN_TYPE_COLORS } from '@/types/barn'
import { PenType, PenStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Map, LayoutGrid, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StructureModals } from '@/components/barns/structure-modals'

export default function BarnsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<PenType | undefined>()
  const [status, setStatus] = useState<PenStatus | undefined>()
  
  const [modalState, setModalState] = useState<{
    type: 'zone' | 'row' | 'barn' | 'pen' | null
    parentId?: string
    initialData?: any
  }>({ type: null })

  const { data, isLoading } = useBarns({
    page,
    pageSize: 10,
    search: search || undefined,
    type,
    status,
  })

  const { mutate: deleteBarn, isPending: isDeleting } = useDeleteBarn()

  const columns: ColumnDef<PenWithDetails>[] = [
    {
      accessorKey: 'code',
      header: 'Mã chuồng',
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Tên chuồng',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.notes && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.original.type
        const colors = PEN_TYPE_COLORS[type]
        return (
          <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 font-normal`}>
            {PEN_TYPE_LABELS[type]}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status
        const colors = PEN_STATUS_COLORS[status]
        return (
          <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 font-normal`}>
            {PEN_STATUS_LABELS[status]}
          </Badge>
        )
      },
    },
    {
      id: 'capacity',
      header: 'Công suất',
      cell: ({ row }) => {
        const barn = row.original
        const utilizationRate = barn.utilizationRate ?? 0
        const isFull = utilizationRate >= 100
        const isWarning = utilizationRate >= 85 && utilizationRate < 100
        
        return (
          <div className="space-y-1.5 w-32">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{barn.currentPigsCount} / {barn.capacity}</span>
              <span className="text-muted-foreground">{Math.round(utilizationRate)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isFull ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, utilizationRate)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Cập nhật lần cuối',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(row.original.updatedAt)}</span>,
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
              setModalState({ type: 'pen', initialData: row.original })
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa chuồng ${row.original.name}?`)) {
                deleteBarn(row.original.id)
              }
            }}
            disabled={isDeleting || (row.original.currentPigsCount ?? 0) > 0}
            title={(row.original.currentPigsCount ?? 0) > 0 ? "Không thể xóa chuồng đang có lợn" : "Xóa chuồng"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý chuồng trại"
        description="Quản lý thông tin, phân bố và theo dõi công suất các chuồng"
        action={{
          label: 'Thêm chuồng',
          href: '/barns/new',
        }}
      >
        <div className="hidden sm:flex bg-muted p-1 rounded-lg">
          <Button variant="secondary" size="sm" className="h-8 bg-background shadow-sm">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Danh sách
          </Button>
          <Link href="/barns/map" className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:text-foreground text-muted-foreground">
            <Map className="h-4 w-4 mr-2" />
            Sơ đồ
          </Link>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc mã chuồng..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={type || 'all'} onValueChange={(val) => setType(val === 'all' ? undefined : val as PenType)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Tất cả loại chuồng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại chuồng</SelectItem>
              {Object.entries(PEN_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status || 'all'} onValueChange={(val) => setStatus(val === 'all' ? undefined : val as PenStatus)}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(PEN_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
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
        onRowClick={(row) => router.push(`/barns/${row.id}`)}
        emptyTitle="Không tìm thấy chuồng nào"
        emptyDescription="Bạn chưa tạo chuồng nào hoặc không có chuồng nào khớp với bộ lọc."
      />
      
      <StructureModals
        isOpen={modalState.type !== null}
        type={modalState.type}
        parentId={modalState.parentId}
        initialData={modalState.initialData}
        onClose={() => setModalState({ type: null })}
      />
    </div>
  )
}
