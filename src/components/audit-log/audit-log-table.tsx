'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AuditAction } from '@prisma/client'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { AuditLogDetailModal } from './audit-log-detail-modal'

interface AuditLogTableProps {
  logs: any[]
}

const ACTION_CONFIG: Record<AuditAction, { label: string, color: string }> = {
  CREATE: { label: 'Tạo mới', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  UPDATE: { label: 'Cập nhật', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  DELETE: { label: 'Xóa', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  LOGIN: { label: 'Đăng nhập', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  LOGOUT: { label: 'Đăng xuất', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  STATUS_CHANGE: { label: 'Đổi trạng thái', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  RESTORE: { label: 'Khôi phục', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  MOVE: { label: 'Chuyển chỗ', color: 'text-purple-600 bg-purple-50 border-purple-200' },
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null)

  return (
    <>
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Thời gian</TableHead>
              <TableHead className="w-[200px]">Người thực hiện</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
              <TableHead className="w-[150px]">Đối tượng</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[80px] text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không tìm thấy nhật ký hệ thống
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{log.user?.name || 'Hệ thống'}</span>
                      {log.user?.email && (
                        <span className="text-xs text-muted-foreground">{log.user.email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-medium ${ACTION_CONFIG[log.action as AuditAction]?.color}`}>
                      {ACTION_CONFIG[log.action as AuditAction]?.label || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{log.entity}</span>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm">
                    {log.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AuditLogDetailModal 
        log={selectedLog} 
        open={!!selectedLog} 
        onOpenChange={(open) => !open && setSelectedLog(null)} 
      />
    </>
  )
}
