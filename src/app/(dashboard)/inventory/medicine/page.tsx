'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useMedicineStocks } from '@/hooks/use-inventory'
import { MedicineStockWithDetails } from '@/types/inventory'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

import { MedicineImportModal } from '@/components/inventory/medicine-import-modal'

export default function MedicineInventoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useMedicineStocks({
    page,
    pageSize: 10,
    search: search || undefined,
  })

  // columns definition remains the same
  const columns: ColumnDef<MedicineStockWithDetails>[] = [
    {
      id: 'medicineType',
      header: 'Tên Thuốc/Vaccine',
      cell: ({ row }) => (
        <span className="font-semibold text-rose-700 dark:text-rose-400">
          {row.original.medicineType?.name || 'Không rõ'}
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Số lượng tồn',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.quantity} Lọ/Gói
        </span>
      ),
    },
    {
      accessorKey: 'supplierId',
      header: 'Nhà cung cấp',
      cell: ({ row }) => <span className="text-sm">{row.original.supplierId || 'N/A'}</span>,
    },
    {
      accessorKey: 'batchNumber',
      header: 'Số lô (Batch)',
      cell: ({ row }) => <span className="text-sm font-mono">{row.original.batchNumber || 'N/A'}</span>,
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
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Kho Thuốc & Vaccine"
          description="Quản lý tồn kho thuốc thú y và vaccine phòng bệnh"
        />
        <MedicineImportModal />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên thuốc..."
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
        emptyTitle="Kho thuốc trống"
        emptyDescription="Không có dữ liệu tồn kho thuốc hoặc vaccine."
      />
    </div>
  )
}
