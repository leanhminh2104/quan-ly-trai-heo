'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { useTasks } from '@/hooks/use-task'
import { TaskList } from '@/components/tasks/task-list'
import { TaskForm } from '@/components/tasks/task-form'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskStatus, TaskType } from '@prisma/client'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang làm',
  COMPLETED: 'Hoàn thành',
  OVERDUE: 'Quá hạn',
  CANCELLED: 'Đã hủy',
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  FEEDING: 'Cho ăn',
  VACCINATION: 'Tiêm vaccine',
  TREATMENT: 'Điều trị bệnh',
  CLEANING: 'Dọn dẹp',
  DISINFECTION: 'Sát trùng',
  WEIGHING: 'Cân đo',
  DEWORMING: 'Tẩy giun',
  MATING: 'Phối giống',
  FARROWING: 'Đỡ đẻ',
  WEANING: 'Cai sữa',
  MOVING: 'Chuyển chuồng',
  OTHER: 'Khác',
}

export function TasksClient() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | 'ALL'>('ALL')
  const [type, setType] = useState<TaskType | 'ALL'>('ALL')
  const [assignedToMe, setAssignedToMe] = useState(false)

  const { data, isLoading } = useTasks({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status === 'ALL' ? undefined : status,
    type: type === 'ALL' ? undefined : type,
    assignedToMe: assignedToMe || undefined,
  })

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Quản lý Công việc"
          description="Phân công, theo dõi và quản lý công việc hàng ngày trong trang trại"
        />
        <div className="flex items-center gap-2">
          <TaskForm />
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm công việc..."
              className="pl-9 bg-background h-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          
          <Select value={status} onValueChange={(val: any) => { setStatus(val); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(val: any) => { setType(val); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Loại công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 ml-auto">
            <Checkbox 
              id="assignedToMe" 
              checked={assignedToMe}
              onCheckedChange={(c) => { setAssignedToMe(!!c); setPage(1) }}
            />
            <Label htmlFor="assignedToMe" className="cursor-pointer">Việc của tôi</Label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="text-muted-foreground">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <TaskList tasks={data?.items || []} />

            {data && data.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <span className="text-sm text-muted-foreground px-4">
                    Trang {page} / {data.totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                      className={page === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
