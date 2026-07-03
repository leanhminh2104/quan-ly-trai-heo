'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { EmployeeWithDetails } from '@/types/employee'
import { useDeleteEmployee } from '@/hooks/use-employee'
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
import { Edit, MoreHorizontal, Trash2, UserCog, User, MapPin, Phone } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/utils'

interface EmployeeListProps {
  data: EmployeeWithDetails[]
  isLoading: boolean
  onEdit: (employee: EmployeeWithDetails) => void
}

export function EmployeeList({ data, isLoading, onEdit }: EmployeeListProps) {
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee()
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeWithDetails | null>(null)

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      deleteEmployee(employeeToDelete.id, {
        onSettled: () => setEmployeeToDelete(null)
      })
    }
  }

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'MANAGER': return 'Quản lý'
      case 'VETERINARIAN': return 'Bác sĩ thú y'
      case 'WORKER': return 'Công nhân'
      case 'GUARD': return 'Bảo vệ'
      default: return role || 'Khác'
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'VETERINARIAN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'WORKER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải danh sách nhân viên...</div>
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/40 rounded-lg border border-dashed">
        <UserCog className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Chưa có nhân viên nào</h3>
        <p className="text-sm text-muted-foreground mt-1">Bấm "Thêm mới" để tạo hồ sơ nhân sự đầu tiên.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Nhân viên</TableHead>
            <TableHead>Chức vụ / Phòng ban</TableHead>
            <TableHead>Khu vực quản lý</TableHead>
            <TableHead>Lương</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((emp) => (
            <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{emp.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {emp.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {emp.phone}</span>}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant="secondary" className={getRoleColor(emp.role)}>{getRoleLabel(emp.role)}</Badge>
                  {emp.department && <div className="text-xs text-muted-foreground">{emp.department}</div>}
                </div>
              </TableCell>
              <TableCell>
                {emp.assignedZoneId ? (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <MapPin className="w-3 h-3 text-primary" />
                    {emp.assignedZoneName || 'Đã phân công'}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Chưa phân công</span>
                )}
              </TableCell>
              <TableCell>
                {emp.salary ? <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(emp.salary)}</span> : '-'}
              </TableCell>
              <TableCell>
                {emp.isActive ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Đang làm việc</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Đã nghỉ việc</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]" title={emp.notes || ''}>
                  {emp.notes || '--'}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-semibold">Hành động</div>
                    <DropdownMenuItem onClick={() => onEdit(emp)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setEmployeeToDelete(emp)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/30 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa hồ sơ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open: boolean) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hồ sơ của nhân viên <span className="font-bold text-foreground">{employeeToDelete?.name}</span> không? Hành động này sẽ chuyển trạng thái của nhân viên thành đã nghỉ việc và ẩn khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e: React.MouseEvent) => { e.preventDefault(); handleDeleteConfirm(); }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa hồ sơ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
