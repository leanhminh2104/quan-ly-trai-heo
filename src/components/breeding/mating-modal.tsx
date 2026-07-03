'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createMating } from '@/actions/breeding'
import { matingSchema, MatingInput } from '@/validators/breeding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export function MatingModal() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<MatingInput>({
    resolver: zodResolver(matingSchema) as any,
    defaultValues: {
      sowId: '',
      boarId: '',
      matingDate: new Date(),
      matingNumber: 1,
    },
  })

  const onSubmit = async (data: MatingInput) => {
    try {
      const res = await createMating(data)
      if (res.success) {
        toast.success('Tạo phiếu phối giống thành công')
        queryClient.invalidateQueries({ queryKey: ['matings'] })
        setOpen(false)
        form.reset()
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Tạo phiếu phối
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo phiếu phối giống mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sowId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Nái <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID nái (tạm thời)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="boarId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Đực giống</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID đực (hoặc để trống nếu tinh NT)" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="matingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày phối <span className="text-red-500">*</span></FormLabel>
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
              name="technician"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người phối</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên kỹ thuật viên" {...field} value={field.value || ''} />
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu phiếu phối
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
