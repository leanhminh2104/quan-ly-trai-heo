'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useTreatments } from '@/hooks/use-health'
import { TreatmentWithDetails } from '@/types/health'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Search, Plus, Stethoscope } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

import { TreatmentModal } from '@/components/health/treatment-modal'

export default function TreatmentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useTreatments({
    page,
    pageSize: 10,
    search: search || undefined,
  })

  const columns: ColumnDef<TreatmentWithDetails>[] = [
    {
      id: 'pig',
      header: 'Mã lợn',
      cell: ({ row }) => (
        <span className="font-semibold text-rose-700 dark:text-rose-400">
          {row.original.pig?.code || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'treatmentDate',
      header: 'Ngày bắt đầu',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatDate(row.original.treatmentDate)}
        </span>
      ),
    },
    {
      accessorKey: 'diagnosis',
      header: 'Chẩn đoán',
      cell: ({ row }) => (
        <div className="flex flex-col text-sm max-w-[200px]">
          <span className="font-medium truncate" title={row.original.diagnosis || ''}>{row.original.diagnosis}</span>
          {row.original.symptoms && (
            <span className="text-xs text-muted-foreground truncate" title={row.original.symptoms}>{row.original.symptoms}</span>
          )}
        </div>
      ),
    },
    {
      id: 'medicine',
      header: 'Thuốc điều trị',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.medicineType?.name || row.original.medicineName || 'Không rõ'}
        </span>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Liệu trình',
      cell: ({ row }) => <span className="text-sm">{row.original.duration} ngày</span>,
    },
    {
      accessorKey: 'treatedBy',
      header: 'Người điều trị',
      cell: ({ row }) => <span className="text-sm">{row.original.treatedBy || 'N/A'}</span>,
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quản lý Điều trị"
          description="Theo dõi hồ sơ bệnh án và lịch sử sử dụng thuốc của đàn lợn"
        />
        <TreatmentModal />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã lợn..."
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
        emptyTitle="Chưa có dữ liệu điều trị"
        emptyDescription="Danh sách điều trị trống hoặc không khớp với tìm kiếm."
      />
    </div>
  )
}
