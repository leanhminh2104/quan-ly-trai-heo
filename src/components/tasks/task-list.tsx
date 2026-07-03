'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { TaskWithDetails } from '@/types/task'
import { useDeleteTask } from '@/hooks/use-task'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TaskType, TaskStatus } from '@prisma/client'
import { MoreHorizontal, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TaskCompletionModal } from './task-completion-modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string, color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  IN_PROGRESS: { label: 'Đang làm', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  OVERDUE: { label: 'Quá hạn', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
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

interface TaskListProps {
  tasks: TaskWithDetails[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [taskToComplete, setTaskToComplete] = useState<TaskWithDetails | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<TaskWithDetails | null>(null)
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask()

  const handleDelete = () => {
    if (!taskToDelete) return
    deleteTask(taskToDelete.id, {
      onSuccess: () => setTaskToDelete(null)
    })
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Công việc</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Ngày giao</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Chưa có công việc nào.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{task.title}</span>
                      {task.description && (
                        <span className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{TASK_TYPE_LABELS[task.type] || task.type}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 font-medium ${TASK_STATUS_CONFIG[task.status].color}`}>
                      {TASK_STATUS_CONFIG[task.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.assignments.length > 0 ? (
                        task.assignments.map(a => (
                          <Badge key={a.id} variant="secondary" className="text-xs font-normal">
                            {a.employee.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Chưa giao</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{formatDate(task.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-semibold">Hành động</div>
                        
                        {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
                          <DropdownMenuItem onClick={() => setTaskToComplete(task)} className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Hoàn thành
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setTaskToDelete(task)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskCompletionModal 
        task={taskToComplete} 
        open={!!taskToComplete} 
        onOpenChange={(open) => !open && setTaskToComplete(null)} 
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa công việc "{taskToDelete?.title}". 
              Dữ liệu sẽ không thể khôi phục lại được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
