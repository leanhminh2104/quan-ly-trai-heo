'use client'
// Bản quyền thuộc dalymmo.com

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { penSchema, PenInput } from '@/validators/barn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { PenType, PenStatus } from '@prisma/client'
import { PEN_TYPE_LABELS, PEN_STATUS_LABELS } from '@/lib/constants'
import { useBarnHierarchy } from '@/hooks/use-barn'
import { PenWithDetails } from '@/types/barn'

interface BarnFormProps {
  initialData?: PenWithDetails
  onSubmit: (data: PenInput) => Promise<void>
  isSubmitting?: boolean
}

export function BarnForm({ initialData, onSubmit, isSubmitting }: BarnFormProps) {
  const { data: hierarchy, isLoading: isLoadingHierarchy } = useBarnHierarchy()

  // Flatten hierarchy into a list of barns for selection
  const availableBarns = hierarchy?.flatMap((zone: any) => 
    zone.rows.flatMap((row: any) => 
      row.barns.map((barn: any) => ({
        id: barn.id,
        name: `${zone.name} > ${row.name} > ${barn.name}`
      }))
    )
  ) || []

  const form = useForm<PenInput>({
    resolver: zodResolver(penSchema) as any,
    defaultValues: {
      barnId: initialData?.barnId || '',
      name: initialData?.name || '',
      code: initialData?.code || '',
      type: (initialData?.type as any) || 'GENERAL',
      status: (initialData?.status as any) || 'AVAILABLE',
      capacity: initialData?.capacity || 10,
      area: initialData?.area || 0,
      temperature: initialData?.temperature || null,
      humidity: initialData?.humidity || null,
      notes: initialData?.notes || '',
      isActive: initialData?.isActive ?? true,
    },
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        barnId: initialData.barnId,
        name: initialData.name,
        code: initialData.code,
        type: initialData.type,
        status: initialData.status,
        capacity: initialData.capacity,
        area: initialData.area,
        temperature: initialData.temperature,
        humidity: initialData.humidity,
        notes: initialData.notes,
        isActive: initialData.isActive,
      })
    }
  }, [initialData, form])

  // Auto-generate name and code for new pens
  useEffect(() => {
    if (!initialData && !form.getValues('code') && !form.getValues('name')) {
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      form.setValue('name', `Ô ${randomNum}`)
      form.setValue('code', `O-${randomNum}`)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="barnId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí (Nhà/Dãy) <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí chuồng">
                        {field.value 
                          ? availableBarns.find(b => b.id === field.value)?.name || (isLoadingHierarchy ? 'Đang tải...' : 'Không tìm thấy vị trí') 
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableBarns.map((barn) => (
                      <SelectItem key={barn.id} value={barn.id}>{barn.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại chuồng <span className="text-red-500">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại chuồng">
                        {field.value ? PEN_TYPE_LABELS[field.value as keyof typeof PEN_TYPE_LABELS] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PEN_TYPE_LABELS).map(([key, label]) => (
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên ô chuồng <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="VD: Ô 01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã ô chuồng <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="VD: A1-01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái">
                        {field.value ? PEN_STATUS_LABELS[field.value as keyof typeof PEN_STATUS_LABELS] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PEN_STATUS_LABELS).map(([key, label]) => (
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
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sức chứa tối đa (con) <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
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
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diện tích (m²)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    {...field} 
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhiệt độ chuẩn (°C)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    {...field} 
                    value={field.value || ''}
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
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
              <FormLabel>Ghi chú / Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Thêm mô tả về chuồng..." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
            {(isSubmitting || form.formState.isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
