'use client'
// Bản quyền thuộc dalymmo.com

import React, { useEffect, useState } from 'react'
import { getFarmInfo, updateFarmInfo } from '@/actions/farm-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { farmUpdateSchema, FarmUpdateInput } from '@/validators/settings'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function FarmInfoForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [farmCode, setFarmCode] = useState('')

  const form = useForm<FarmUpdateInput>({
    resolver: zodResolver(farmUpdateSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      description: '',
    },
  })

  useEffect(() => {
    getFarmInfo().then(res => {
      if (res.success && res.data) {
        form.reset({
          name: res.data.name || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          description: res.data.description || '',
        })
        setFarmCode(res.data.code)
      }
      setLoading(false)
    })
  }, [form])

  const onSubmit = async (data: FarmUpdateInput) => {
    setSaving(true)
    const res = await updateFarmInfo(data)
    if (res.success) {
      toast.success('Đã cập nhật thông tin trang trại')
    } else {
      toast.error(res.error || 'Cập nhật thất bại')
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="p-4 text-muted-foreground animate-pulse">Đang tải thông tin...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin trang trại</CardTitle>
        <CardDescription>
          Cập nhật thông tin cơ bản của trang trại.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên trang trại <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-2">
              <label className="text-sm font-medium">Mã code</label>
              <Input value={farmCode} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Mã code dùng để định danh hệ thống, không thể thay đổi.</p>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
