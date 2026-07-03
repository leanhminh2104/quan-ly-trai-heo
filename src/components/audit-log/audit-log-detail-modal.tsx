'use client'
// Bản quyền thuộc dalymmo.com

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AuditLogDetailModalProps {
  log: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailModal({ log, open, onOpenChange }: AuditLogDetailModalProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Chi tiết thao tác</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">Người thực hiện: </span>
              {log.user?.name || 'Hệ thống'}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Hành động: </span>
              {log.action}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Đối tượng: </span>
              {log.entity} (ID: {log.entityId || 'N/A'})
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Thời gian: </span>
              {new Date(log.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>

          {log.description && (
            <div className="text-sm">
              <span className="font-semibold text-muted-foreground">Mô tả: </span>
              {log.description}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {log.dataBefore && Object.keys(log.dataBefore).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Dữ liệu trước (Before)</h4>
                <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-muted/50">
                  <pre className="text-xs">{JSON.stringify(log.dataBefore, null, 2)}</pre>
                </ScrollArea>
              </div>
            )}
            
            {log.dataAfter && Object.keys(log.dataAfter).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Dữ liệu sau (After)</h4>
                <ScrollArea className="h-[250px] w-full rounded-md border p-4 bg-muted/50">
                  <pre className="text-xs">{JSON.stringify(log.dataAfter, null, 2)}</pre>
                </ScrollArea>
              </div>
            )}
          </div>
          
          {(!log.dataBefore || Object.keys(log.dataBefore).length === 0) && (!log.dataAfter || Object.keys(log.dataAfter).length === 0) && (
            <div className="p-4 border rounded-md bg-muted/30 text-center text-sm text-muted-foreground mt-4">
              Không có dữ liệu chi tiết cho thao tác này
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
