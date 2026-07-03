'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { useTransactions } from '@/hooks/use-finance'
import { TransactionWithDetails } from '@/types/finance'
import { ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { TransactionModal } from '@/components/finance/transaction-modal'
import { IncomeType, ExpenseType } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  PIG_SALE: 'Bán lợn',
  MANURE_SALE: 'Bán phân',
  OTHER_INCOME: 'Thu khác',
}

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  FEED: 'Thức ăn',
  MEDICINE: 'Thuốc',
  VACCINE: 'Vaccine',
  SEMEN: 'Tinh giống',
  ELECTRICITY: 'Điện',
  WATER: 'Nước',
  SALARY: 'Lương',
  DEPRECIATION: 'Khấu hao',
  REPAIR: 'Sửa chữa',
  SUPPLIES: 'Vật tư',
  OTHER: 'Chi khác',
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all')

  const { data, isLoading } = useTransactions({
    page,
    pageSize: 10,
    search: search || undefined,
    tab
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const columns: ColumnDef<TransactionWithDetails>[] = [
    {
      accessorKey: 'date',
      header: 'Ngày Giao dịch',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const isIncome = row.original._type === 'income'
        return (
          <Badge variant="outline" className={`border-0 font-medium ${isIncome ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {isIncome ? 'Thu' : 'Chi'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Danh mục',
      cell: ({ row }) => {
         const label = row.original._type === 'income' 
            ? INCOME_TYPE_LABELS[row.original.type as IncomeType]
            : EXPENSE_TYPE_LABELS[row.original.type as ExpenseType]
         return <span className="text-sm font-medium">{label || row.original.type}</span>
      },
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Số tiền</div>,
      cell: ({ row }) => {
        const isIncome = row.original._type === 'income'
        return (
          <div className={`text-right font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(row.original.amount)}
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Nội dung',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block" title={row.original.description || ''}>
          {row.original.description || row.original.reference || '--'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Sổ quỹ (Thu / Chi)"
          description="Quản lý dòng tiền, hạch toán thu chi của trang trại"
        />
        <div className="flex items-center gap-2">
          <TransactionModal type="income" />
          <TransactionModal type="expense" />
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Tabs defaultValue="all" onValueChange={(v) => { setTab(v as any); setPage(1) }}>
          <div className="p-4 border-b flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="income">Phiếu Thu</TabsTrigger>
              <TabsTrigger value="expense">Phiếu Chi</TabsTrigger>
            </TabsList>
            <div className="relative max-w-sm w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo nội dung..."
                className="pl-9 bg-background h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="m-0 border-0 p-0">
             <div className="p-4">
                <DataTable
                  columns={columns}
                  data={data?.items || []}
                  isLoading={isLoading}
                  page={page}
                  pageCount={data?.totalPages || 1}
                  onPageChange={setPage}
                  emptyTitle="Sổ quỹ trống"
                  emptyDescription="Chưa có giao dịch nào được ghi nhận."
                />
             </div>
          </TabsContent>
          <TabsContent value="income" className="m-0 border-0 p-0">
             <div className="p-4">
                <DataTable
                  columns={columns}
                  data={data?.items || []}
                  isLoading={isLoading}
                  page={page}
                  pageCount={data?.totalPages || 1}
                  onPageChange={setPage}
                  emptyTitle="Sổ quỹ trống"
                  emptyDescription="Chưa có phiếu thu nào được ghi nhận."
                />
             </div>
          </TabsContent>
          <TabsContent value="expense" className="m-0 border-0 p-0">
            <div className="p-4">
                <DataTable
                  columns={columns}
                  data={data?.items || []}
                  isLoading={isLoading}
                  page={page}
                  pageCount={data?.totalPages || 1}
                  onPageChange={setPage}
                  emptyTitle="Sổ quỹ trống"
                  emptyDescription="Chưa có phiếu chi nào được ghi nhận."
                />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
