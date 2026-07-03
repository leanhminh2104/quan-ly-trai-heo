'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUltrasound } from '@/actions/breeding'
import { ultrasoundSchema, UltrasoundInput } from '@/validators/breeding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

interface UltrasoundModalProps {
  matingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UltrasoundModal({ matingId, open, onOpenChange }: UltrasoundModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<UltrasoundInput>({
    resolver: zodResolver(ultrasoundSchema) as any,
    defaultValues: {
      matingId,
      ultrasoundDate: new Date(),
      ultrasoundResult: 'POSITIVE',
      ultrasoundFetusCount: undefined,
      notes: ''
    },
  })

  const onSubmit = async (data: UltrasoundInput) => {
    try {
      const res = await updateUltrasound(data)
      if (res.success) {
        toast.success('Cập nhật kết quả siêu âm thành công')
        queryClient.invalidateQueries({ queryKey: ['matings'] })
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật kết quả siêu âm</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ultrasoundDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày siêu âm <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} 
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ultrasoundResult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kết quả <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn kết quả" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="POSITIVE">Đậu thai (Dương tính)</SelectItem>
                      <SelectItem value="NEGATIVE">Không đậu (Âm tính)</SelectItem>
                      <SelectItem value="UNCERTAIN">Chưa rõ (Khó xác định)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ultrasoundFetusCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số thai ước tính (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Số thai" 
                      {...field} 
                      value={field.value || ''} 
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thêm ghi chú..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu kết quả
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
