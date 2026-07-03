'use client'
// Bản quyền thuộc dalymmo.com

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEmployeeSchema, updateEmployeeSchema, CreateEmployeeInput, UpdateEmployeeInput } from '@/validators/employee'
import { EmployeeWithDetails } from '@/types/employee'
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employee'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useBarnHierarchy } from '@/hooks/use-barn'

interface EmployeeFormProps {
  initialData?: EmployeeWithDetails | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function EmployeeForm({ initialData, onSuccess, onCancel }: EmployeeFormProps) {
  const { data: hierarchy } = useBarnHierarchy()
  
  // Lấy danh sách các khu vực (BarnZone) từ hierarchy
  const zones = hierarchy?.map(z => ({ id: z.id, name: z.name })) || []

  const isEditing = !!initialData

  const form = useForm<any>({
    resolver: zodResolver(isEditing ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      role: initialData?.role || 'WORKER',
      department: initialData?.department || '',
      salary: initialData?.salary || 0,
      assignedZoneId: initialData?.assignedZoneId || '',
      notes: initialData?.notes || '',
      isActive: initialData?.isActive ?? true,
      ...(isEditing && { id: initialData.id })
    }
  })

  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee()
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee()
  const isSaving = isCreating || isUpdating

  function onSubmit(data: any) {
    // Map empty string to null/undefined where needed by validation/DB if we want,
    // but the schema allows empty strings/nulls for optional fields.
    const cleanedData = {
      ...data,
      assignedZoneId: data.assignedZoneId === 'none' ? null : data.assignedZoneId
    }

    if (isEditing) {
      updateEmployee(cleanedData as UpdateEmployeeInput, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        }
      })
    } else {
      createEmployee(cleanedData as CreateEmployeeInput, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        }
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên *</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên nhân viên" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập SĐT" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập email" type="email" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò / Chức vụ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò">
                          {field.value === 'ADMIN' ? 'Quản trị viên' : field.value === 'MANAGER' ? 'Quản lý' : field.value === 'VETERINARIAN' ? 'Bác sĩ thú y' : field.value === 'WORKER' ? 'Công nhân' : field.value === 'GUARD' ? 'Bảo vệ' : field.value === 'OTHER' ? 'Khác' : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                  <SelectContent>
                    <SelectItem value="MANAGER">Quản lý</SelectItem>
                    <SelectItem value="VETERINARIAN">Bác sĩ thú y</SelectItem>
                    <SelectItem value="WORKER">Công nhân</SelectItem>
                    <SelectItem value="GUARD">Bảo vệ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phòng ban</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập phòng ban" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mức lương (VNĐ)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedZoneId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Phân công khu vực</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || 'none'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khu vực" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">-- Không phân công cụ thể --</SelectItem>
                    {zones.map(z => (
                      <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập địa chỉ" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ghi chú thêm..." {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel>Trạng thái hoạt động</FormLabel>
                  <div className="text-[0.8rem] text-muted-foreground">
                    Nhân viên đang làm việc tại trang trại
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
