'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFarrowing } from '@/actions/breeding'
import { farrowingSchema, FarrowingInput } from '@/validators/breeding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface FarrowingModalProps {
  matingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FarrowingModal({ matingId, open, onOpenChange }: FarrowingModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<FarrowingInput>({
    resolver: zodResolver(farrowingSchema) as any,
    defaultValues: {
      matingId,
      farrowingDate: new Date(),
      bornAlive: 0,
      bornDead: 0,
      mummified: 0,
      notes: ''
    },
  })

  const onSubmit = async (data: FarrowingInput) => {
    try {
      const res = await createFarrowing(data)
      if (res.success) {
        toast.success('Báo đẻ thành công')
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
          <DialogTitle>Báo đẻ</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="farrowingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày đẻ <span className="text-red-500">*</span></FormLabel>
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
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bornAlive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sống <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bornDead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chết</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mummified"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khô</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
