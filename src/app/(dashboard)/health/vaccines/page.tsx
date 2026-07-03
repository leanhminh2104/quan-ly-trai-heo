'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useVaccinations } from '@/hooks/use-health'
import { VaccinationWithDetails } from '@/types/health'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Search, Plus, Syringe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'

import { VaccinationModal } from '@/components/health/vaccination-modal'

export default function VaccinesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useVaccinations({
    page,
    pageSize: 10,
    search: search || undefined,
  })

  const columns: ColumnDef<VaccinationWithDetails>[] = [
    {
      id: 'pig',
      header: 'Mã lợn',
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          {row.original.pig?.code || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'vaccinatedAt',
      header: 'Ngày tiêm',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatDate(row.original.vaccinatedAt)}
        </span>
      ),
    },
    {
      id: 'vaccineType',
      header: 'Loại Vaccine',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.vaccineType?.name || 'Không rõ'}
        </span>
      ),
    },
    {
      accessorKey: 'dosage',
      header: 'Liều lượng',
      cell: ({ row }) => <span className="text-sm">{row.original.dosage || 'N/A'}</span>,
    },
    {
      accessorKey: 'vaccinatedBy',
      header: 'Người tiêm',
      cell: ({ row }) => <span className="text-sm">{row.original.vaccinatedBy || 'N/A'}</span>,
    },
    {
      accessorKey: 'nextDueDate',
      header: 'Nhắc lại (Dự kiến)',
      cell: ({ row }) => (
        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          {row.original.nextDueDate ? formatDate(row.original.nextDueDate) : 'Không cần'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Quản lý Tiêm phòng"
          description="Theo dõi lịch sử tiêm vaccine và lịch nhắc lại của đàn lợn"
        />
        <VaccinationModal />
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
        emptyTitle="Chưa có dữ liệu tiêm phòng"
        emptyDescription="Danh sách tiêm phòng trống hoặc không khớp với tìm kiếm."
      />
    </div>
  )
}
