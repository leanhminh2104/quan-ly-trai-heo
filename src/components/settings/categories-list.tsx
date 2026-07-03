'use client'
// Bản quyền thuộc dalymmo.com

import React, { useEffect, useState } from 'react'
import { getCategories, createCategory, updateCategory, toggleCategoryStatus, deleteCategory } from '@/actions/category-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Power, PowerOff, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, CategoryInput } from '@/validators/settings'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: '',
      name: '',
      code: '',
      isActive: true,
    },
  })

  const loadData = () => {
    setLoading(true)
    getCategories().then(res => {
      if (res.success && res.data) {
        setCategories(res.data)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  const openDialog = (category?: any) => {
    if (category) {
      setEditingId(category.id)
      form.reset({
        type: category.type,
        name: category.name,
        code: category.code || '',
        isActive: category.isActive,
      })
    } else {
      setEditingId(null)
      form.reset({ type: '', name: '', code: '', isActive: true })
    }
    setIsOpen(true)
  }

  const onSubmit = async (data: CategoryInput) => {
    setSaving(true)
    let res
    if (editingId) {
      res = await updateCategory(editingId, data)
    } else {
      res = await createCategory(data)
    }

    if (res.success) {
      toast.success(editingId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công')
      setIsOpen(false)
      loadData()
    } else {
      toast.error(res.error || 'Thao tác thất bại')
    }
    setSaving(false)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleCategoryStatus(id, !currentStatus)
    if (res.success) {
      toast.success('Cập nhật trạng thái thành công')
      loadData()
    } else {
      toast.error(res.error || 'Thao tác thất bại')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteCategory(id)
    if (res.success) {
      toast.success('Xóa danh mục thành công')
      loadData()
    } else {
      toast.error(res.error || 'Thao tác thất bại')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Danh mục</CardTitle>
          <CardDescription>
            Quản lý các danh mục phân loại trong hệ thống.
          </CardDescription>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục
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
                  <TableHead>Loại (Type)</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mã (Code)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Chưa có danh mục nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.type}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.code || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={c.isActive ? 'default' : 'secondary'}>
                          {c.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openDialog(c)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleStatus(c.id, c.isActive)}
                            title={c.isActive ? "Tạm khóa" : "Mở khóa"}
                          >
                            {c.isActive ? (
                              <PowerOff className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Power className="w-4 h-4 text-green-500" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn xóa danh mục <b>{c.name}</b> không? Hành động này sẽ ẩn danh mục khỏi hệ thống.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground">
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
              <DialogTitle>{editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle>
              <DialogDescription>
                Nhập thông tin danh mục phân loại.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control as any}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhóm loại (Type) <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: THUOC, CHI_PHI, LOAI_LON..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên danh mục <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Thuốc kháng sinh" {...field} />
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
                      <FormLabel>Mã danh mục (tùy chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: KHANG_SINH" {...field} value={field.value || ''} />
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
