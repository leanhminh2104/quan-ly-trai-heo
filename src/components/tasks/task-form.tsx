'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema, CreateTaskInput } from '@/validators/task'
import { useCreateTask } from '@/hooks/use-task'
import { useEmployees } from '@/hooks/use-employee'
import { TaskType } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'

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

export function TaskForm() {
  const [open, setOpen] = useState(false)
  const { mutate: create, isPending } = useCreateTask()
  
  // Fetch employees to assign task
  const { data: empData } = useEmployees({ page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' })
  const employees = empData?.items || []

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: '',
      type: 'OTHER',
      priority: 0,
      description: '',
      notes: '',
      assignedTo: [],
    },
  })

  const onSubmit = (data: CreateTaskInput) => {
    create(data, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-emerald-600 text-primary-foreground shadow hover:bg-emerald-700">
        <Plus className="mr-2 h-4 w-4" /> Giao việc
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Giao việc mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tiêu đề <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề công việc..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại công việc <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại">
                            {field.value ? TASK_TYPE_LABELS[field.value as TaskType] : undefined}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TASK_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức độ ưu tiên (0-5)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={5} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={() => (
                  <FormItem className="md:col-span-2">
                    <div className="mb-4">
                      <FormLabel>Giao cho (Người thực hiện) <span className="text-red-500">*</span></FormLabel>
                    </div>
                    <ScrollArea className="h-[120px] w-full rounded-md border p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {employees.map((emp) => (
                          <FormField
                            key={emp.id}
                            control={form.control as any}
                            name="assignedTo"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={emp.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(emp.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), emp.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value: string) => value !== emp.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {emp.name} {emp.role ? `(${emp.role})` : ''}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả các bước thực hiện..." className="resize-none" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Giao việc
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
