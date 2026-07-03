'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useFeedStocks } from '@/hooks/use-inventory'
import { FeedStockWithDetails } from '@/types/inventory'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Search, Plus, PackageOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

import { FeedImportModal } from '@/components/inventory/feed-import-modal'

export default function FeedInventoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useFeedStocks({
    page,
    pageSize: 10,
    search: search || undefined,
  })

  // columns definition remains the same
  const columns: ColumnDef<FeedStockWithDetails>[] = [
    {
      id: 'feedType',
      header: 'Loại cám',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-700 dark:text-amber-400">
          {row.original.feedType?.name || 'Không rõ'}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Số lượng tồn',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.quantity} kg
        </span>
      ),
    },
    {
      accessorKey: 'importDate',
      header: 'Ngày nhập',
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.importDate)}</span>,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Hạn sử dụng',
      cell: ({ row }) => (
        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
          {row.original.expiryDate ? formatDate(row.original.expiryDate) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'supplierId',
      header: 'Nhà cung cấp',
      cell: ({ row }) => <span className="text-sm">{row.original.supplierId || 'N/A'}</span>,
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Kho Thức ăn (Cám)"
          description="Quản lý tồn kho, nhập xuất cám cho trang trại"
        />
        <FeedImportModal />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên cám..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        page={page}
        pageCount={data?.totalPages || 1}
        onPageChange={setPage}
        emptyTitle="Kho cám trống"
        emptyDescription="Không có dữ liệu tồn kho cám."
      />
    </div>
  )
}
