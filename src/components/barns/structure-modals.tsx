'use client'
// Bản quyền thuộc dalymmo.com

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { barnZoneSchema, barnRowSchema, barnSchema } from '@/validators/barn'
import {
  useCreateBarnZone, useUpdateBarnZone, useDeleteBarnZone,
  useCreateBarnRow, useUpdateBarnRow, useDeleteBarnRow,
  useCreateBarnLoc, useUpdateBarnLoc, useDeleteBarnLoc
} from '@/hooks/use-barn-structure'
import { useCreateBarn, useUpdateBarn, useDeleteBarn } from '@/hooks/use-barn'
import { BarnForm as PenForm } from '@/components/barns/barn-form'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface StructureModalsProps {
  isOpen: boolean
  type: 'zone' | 'row' | 'barn' | 'pen' | null
  parentId?: string
  initialData?: any
  onClose: () => void
}

export function StructureModals({ isOpen, type, parentId, initialData, onClose }: StructureModalsProps) {
  if (!isOpen || !type) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {type === 'zone' && <ZoneForm initialData={initialData} onClose={onClose} />}
      {type === 'row' && <RowForm parentId={parentId} initialData={initialData} onClose={onClose} />}
      {type === 'barn' && <BarnForm parentId={parentId} initialData={initialData} onClose={onClose} />}
      {type === 'pen' && <PenModalForm parentId={parentId} initialData={initialData} onClose={onClose} />}
    </Dialog>
  )
}

function ZoneForm({ initialData, onClose }: { initialData?: any, onClose: () => void }) {
  const { mutate: createZone, isPending: isCreating } = useCreateBarnZone()
  const { mutate: updateZone, isPending: isUpdating } = useUpdateBarnZone()
  const { mutate: deleteZone, isPending: isDeleting } = useDeleteBarnZone()

  const form = useForm({
    resolver: zodResolver(barnZoneSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
    }
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: any) => {
    if (initialData) {
      updateZone({ id: initialData.id, data }, { onSuccess: onClose })
    } else {
      createZone(data, { onSuccess: onClose })
    }
  }

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa khu vực này?')) {
      deleteZone(initialData.id, { onSuccess: onClose })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật Khu vực' : 'Thêm Khu vực mới'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khu vực <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: Khu A" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã khu vực <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: KHU_A" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea placeholder="Mô tả..." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center">
            {initialData ? (
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

function RowForm({ parentId, initialData, onClose }: { parentId?: string, initialData?: any, onClose: () => void }) {
  const { mutate: createRow, isPending: isCreating } = useCreateBarnRow()
  const { mutate: updateRow, isPending: isUpdating } = useUpdateBarnRow()
  const { mutate: deleteRow, isPending: isDeleting } = useDeleteBarnRow()

  const form = useForm({
    resolver: zodResolver(barnRowSchema) as any,
    defaultValues: {
      zoneId: initialData?.zoneId || parentId || '',
      name: initialData?.name || '',
      code: initialData?.code || '',
    }
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: any) => {
    if (initialData) {
      updateRow({ id: initialData.id, data }, { onSuccess: onClose })
    } else {
      createRow(data, { onSuccess: onClose })
    }
  }

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa dãy chuồng này?')) {
      deleteRow(initialData.id, { onSuccess: onClose })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật Dãy chuồng' : 'Thêm Dãy chuồng mới'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên dãy <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: Dãy 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã dãy <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: DAY_1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center">
            {initialData ? (
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

function BarnForm({ parentId, initialData, onClose }: { parentId?: string, initialData?: any, onClose: () => void }) {
  const { mutate: createBarn, isPending: isCreating } = useCreateBarnLoc()
  const { mutate: updateBarn, isPending: isUpdating } = useUpdateBarnLoc()
  const { mutate: deleteBarn, isPending: isDeleting } = useDeleteBarnLoc()

  const form = useForm({
    resolver: zodResolver(barnSchema) as any,
    defaultValues: {
      rowId: initialData?.rowId || parentId || '',
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
    }
  })

  const isPending = isCreating || isUpdating

  const onSubmit = (data: any) => {
    if (initialData) {
      updateBarn({ id: initialData.id, data }, { onSuccess: onClose })
    } else {
      createBarn(data, { onSuccess: onClose })
    }
  }

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa nhà chuồng này?')) {
      deleteBarn(initialData.id, { onSuccess: onClose })
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật Nhà chuồng' : 'Thêm Nhà chuồng mới'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên nhà <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: Nhà 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã nhà <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="VD: NHA_1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea placeholder="Mô tả..." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="mt-6 flex justify-between sm:justify-between items-center">
            {initialData ? (
              <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}

function PenModalForm({ parentId, initialData, onClose }: { parentId?: string, initialData?: any, onClose: () => void }) {
  const { mutate: createPen, isPending: isCreating } = useCreateBarn()
  const { mutate: updatePen, isPending: isUpdating } = useUpdateBarn()
  const { mutate: deletePen, isPending: isDeleting } = useDeleteBarn()

  const isPending = isCreating || isUpdating

  const onSubmit = async (data: any) => {
    if (initialData) {
      updatePen({ id: initialData.id, ...data }, { onSuccess: onClose })
    } else {
      createPen(data, { onSuccess: onClose })
    }
  }

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa ô chuồng này?')) {
      deletePen(initialData.id, { onSuccess: onClose })
    }
  }

  // Cần chuẩn bị initialData cho đúng với cấu trúc của BarnForm (cần barnId)
  const formattedInitialData = initialData ? { ...initialData } : (parentId ? { barnId: parentId } : undefined)

  return (
    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Cập nhật Ô chuồng' : 'Thêm Ô chuồng mới'}</DialogTitle>
      </DialogHeader>
      <div className="py-2">
        <PenForm 
          initialData={formattedInitialData} 
          onSubmit={onSubmit as any}
          isSubmitting={isPending}
        />
        {initialData && (
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" /> Xóa ô chuồng
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}
