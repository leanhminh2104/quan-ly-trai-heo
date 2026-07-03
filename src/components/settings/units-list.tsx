'use client'
// Bản quyền thuộc dalymmo.com

import React, { useEffect, useState } from 'react'
import { getUnits, createUnit, updateUnit, toggleUnitStatus } from '@/actions/unit-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Power, PowerOff, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unitSchema, UnitInput } from '@/validators/settings'
import { toast } from 'sonner'

export function UnitsList() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isActive: true,
    },
  })

  const loadData = () => {
    setLoading(true)
    getUnits().then(res => {
      if (res.success && res.data) {
        setUnits(res.data)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const openDialog = (unit?: any) => {
    if (unit) {
      setEditingId(unit.id)
      form.reset({
        name: unit.name,
        code: unit.code,
        description: unit.description || '',
        isActive: unit.isActive,
      })
    } else {
      setEditingId(null)
      form.reset({ name: '', code: '', description: '', isActive: true })
    }
    setIsOpen(true)
  }

  const onSubmit = async (data: UnitInput) => {
    setSaving(true)
    let res
    if (editingId) {
      res = await updateUnit(editingId, data)
    } else {
      res = await createUnit(data)
    }

    if (res.success) {
      toast.success(editingId ? 'Cập nhật đơn vị thành công' : 'Thêm đơn vị thành công')
      setIsOpen(false)
      loadData()
    } else {
      toast.error(res.error || 'Thao tác thất bại')
    }
    setSaving(false)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleUnitStatus(id, !currentStatus)
    if (res.success) {
      toast.success('Cập nhật trạng thái thành công')
      loadData()
    } else {
      toast.error(res.error || 'Thao tác thất bại')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Đơn vị tính</CardTitle>
          <CardDescription>
            Quản lý các đơn vị đo lường sử dụng trong toàn hệ thống.
          </CardDescription>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm đơn vị
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground animate-pulse p-4">Đang tải...</div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đơn vị</TableHead>
                  <TableHead>Mã (Code)</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Chưa có đơn vị tính nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  units.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.code}</TableCell>
                      <TableCell>{u.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={u.isActive ? 'default' : 'secondary'}>
                          {u.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(u)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            title={u.isActive ? "Tạm khóa" : "Mở khóa"}
                          >
                            {u.isActive ? (
                              <PowerOff className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Power className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Cập nhật đơn vị tính' : 'Thêm đơn vị tính mới'}</DialogTitle>
              <DialogDescription>
                Nhập thông tin đơn vị đo lường.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đơn vị <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Kilogram, Bao, Lít..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã đơn vị <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: KG, BAO, LIT..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Sử dụng cho đo thức ăn" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
