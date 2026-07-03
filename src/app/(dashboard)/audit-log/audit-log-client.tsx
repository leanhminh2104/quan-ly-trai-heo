'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { useAuditLogs, useAuditEntities } from '@/hooks/use-audit-log'
import { AuditLogTable } from '@/components/audit-log/audit-log-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuditAction } from '@prisma/client'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Thêm mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  RESTORE: 'Khôi phục',
  MOVE: 'Chuyển chỗ',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  STATUS_CHANGE: 'Đổi trạng thái',
}

export function AuditLogClient() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState<AuditAction | 'ALL'>('ALL')
  const [entity, setEntity] = useState<string>('ALL')
  const [dateStr, setDateStr] = useState<string>('')

  const { data: entitiesData } = useAuditEntities()
  
  const { data, isLoading } = useAuditLogs({
    page,
    pageSize: 15,
    action: action === 'ALL' ? undefined : action,
    entity: entity === 'ALL' ? undefined : entity,
    startDate: dateStr || undefined,
    endDate: dateStr || undefined,
  })

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Nhật ký Hệ thống"
          description="Theo dõi lịch sử các thao tác thay đổi dữ liệu trên hệ thống"
        />
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <Select value={action} onValueChange={(val: any) => { setAction(val); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả hành động</SelectItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entity} onValueChange={(val) => { setEntity(val || 'ALL'); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Đối tượng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả đối tượng</SelectItem>
              {entitiesData?.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[180px]">
            <Input 
              type="date" 
              value={dateStr}
              onChange={(e) => { setDateStr(e.target.value); setPage(1) }}
              className="w-full"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="text-muted-foreground animate-pulse">Đang tải nhật ký...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <AuditLogTable logs={data?.items || []} />

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
