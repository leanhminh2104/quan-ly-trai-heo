'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { EmployeeList } from '@/components/employees/employee-list'
import { EmployeeForm } from '@/components/employees/employee-form'
import { useEmployees } from '@/hooks/use-employee'
import { EmployeeWithDetails } from '@/types/employee'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Search, Users } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export default function EmployeesClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithDetails | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch data
  const { data, isLoading } = useEmployees({
    page: 1,
    pageSize: 100, // Tạm lấy 100 để không cần phân trang phức tạp lúc đầu
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const handleOpenCreate = () => {
    setEditingEmployee(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (employee: EmployeeWithDetails) => {
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    // Tạm delay việc xóa data để khỏi bị chớp UI khi animation đang chạy
    setTimeout(() => setEditingEmployee(null), 300)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý nhân sự"
        description="Quản lý danh sách nhân viên, công nhân tại trang trại"
      >
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Thêm nhân viên
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Tổng số nhân sự</div>
            <div className="text-2xl font-bold text-primary">{data?.total || 0}</div>
          </div>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo tên, SĐT, email..." 
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <EmployeeList 
        data={data?.items || []} 
        isLoading={isLoading} 
        onEdit={handleOpenEdit} 
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <EmployeeForm 
              initialData={editingEmployee} 
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
