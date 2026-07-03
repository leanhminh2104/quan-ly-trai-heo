'use client'
// Bản quyền thuộc dalymmo.com

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { completeTaskSchema, CompleteTaskInput } from '@/validators/task'
import { useCompleteTask } from '@/hooks/use-task'
import { TaskWithDetails } from '@/types/task'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface TaskCompletionModalProps {
  task: TaskWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskCompletionModal({ task, open, onOpenChange }: TaskCompletionModalProps) {
  const { mutate: complete, isPending } = useCompleteTask()

  const form = useForm<CompleteTaskInput>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: {
      taskId: task?.id || '',
      notes: '',
      images: [],
    },
  })

  // Reset form when task changes
  React.useEffect(() => {
    if (task) {
      form.reset({ taskId: task.id, notes: '', images: [] })
    }
  }, [task, form])

  const onSubmit = (data: CompleteTaskInput) => {
    complete(data, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset()
      }
    })
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Báo cáo hoàn thành công việc</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">Công việc: {task.title}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú / Báo cáo kết quả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả kết quả công việc đã thực hiện..." 
                      className="resize-none h-24" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Xác nhận Hoàn thành
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
