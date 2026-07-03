'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createVaccination } from '@/actions/health'
import { vaccinationSchema, VaccinationInput } from '@/validators/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function VaccinationModal() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<VaccinationInput>({
    resolver: zodResolver(vaccinationSchema) as any,
    defaultValues: {
      pigId: '',
      vaccineTypeId: '',
      vaccinatedAt: new Date(),
    },
  })

  const onSubmit = async (data: VaccinationInput) => {
    try {
      const res = await createVaccination(data)
      if (res.success) {
        toast.success('Thêm lịch tiêm thành công')
        queryClient.invalidateQueries({ queryKey: ['vaccinations'] })
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
          Tạo lịch tiêm
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm lịch tiêm phòng mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pigId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Lợn <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID lợn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vaccineTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Loại Vaccine <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập ID Vaccine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vaccinatedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày tiêm <span className="text-red-500">*</span></FormLabel>
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
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liều lượng</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 2ml" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vaccinatedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người tiêm</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên kỹ thuật viên" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu lịch tiêm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
