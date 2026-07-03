'use client'
// Bản quyền thuộc dalymmo.com

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPigSchema, CreatePigInput, updatePigSchema, UpdatePigInput } from '@/validators/pig'
import { useCreatePig, useUpdatePig, usePig } from '@/hooks/use-pig'
import { PigType, PigGender, PigStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import { PIG_TYPE_LABELS } from '@/lib/constants'

function generatePigCode(type: string) {
  const prefix = type === 'SOW' ? 'NAI' : type === 'BOAR' ? 'DUC' : type === 'GILT' ? 'HB' : type === 'FATTENING' ? 'THIT' : 'LON'
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${randomNum}`
}

export function PigForm({ initialId }: { initialId?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = (searchParams?.get('type') as PigType) || 'SOW'

  const form = useForm<CreatePigInput | UpdatePigInput>({
    resolver: zodResolver(createPigSchema) as any,
    defaultValues: {
      code: initialId ? '' : generatePigCode(defaultType),
      earTag: '',
      name: '',
      type: defaultType,
      gender: ['SOW', 'GILT'].includes(defaultType) ? 'FEMALE' : ['BOAR'].includes(defaultType) ? 'MALE' : 'FEMALE',
      status: 'ACTIVE',
      currentWeight: undefined,
      importPrice: undefined,
      importSource: '',
      notes: '',
    },
  })

  // Load data for edit mode
  const { data: pigData, isLoading: isLoadingPig } = usePig(initialId || '')
  
  useEffect(() => {
    if (initialId && pigData) {
      form.reset({
        code: pigData.code,
        earTag: pigData.earTag || '',
        name: pigData.name || '',
        type: pigData.type,
        gender: pigData.gender,
        status: pigData.status,
        currentWeight: pigData.currentWeight || undefined,
        importPrice: pigData.importPrice || undefined,
        importSource: pigData.importSource || '',
        notes: pigData.notes || '',
      })
    }
  }, [pigData, initialId, form])

  const { mutate: createPig, isPending: isCreating } = useCreatePig()
  const { mutate: updatePig, isPending: isUpdating } = useUpdatePig()

  const isPending = isCreating || isUpdating

  const onSubmit = (data: any) => {
    if (initialId) {
      updatePig({ id: initialId, data }, {
        onSuccess: () => {
          router.back()
        }
      })
    } else {
      createPig(data as CreatePigInput, {
        onSuccess: () => {
          // Redirect back to the correct list based on type
          if (data.type === 'SOW') router.push('/pigs/sows')
          else if (data.type === 'BOAR') router.push('/pigs/boars')
          else if (data.type === 'GILT') router.push('/pigs/gilts')
          else if (data.type === 'FATTENING') router.push('/pigs/fattening')
          else if (data.type === 'PIGLET') router.push('/pigs/piglets')
          else router.push('/pigs')
        }
      })
    }
  }

  if (initialId && isLoadingPig) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-2xl">{initialId ? 'Cập nhật thông tin lợn' : 'Nhập đàn mới'}</CardTitle>
            <CardDescription>{initialId ? `Chỉnh sửa thông tin cho mã ${pigData?.code || ''}` : 'Thêm thông tin cá thể lợn hoặc lô lợn mới vào hệ thống'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã lợn / Mã lô <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: NAI-001 hoặc LO-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thẻ tai</FormLabel>
                    <FormControl>
                      <Input placeholder="Số thẻ tai (tùy chọn)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại lợn <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại lợn">
                            {field.value ? PIG_TYPE_LABELS[field.value] : undefined}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PIG_TYPE_LABELS).map(([key, label]) => (
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
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính">
                            {field.value === 'MALE' ? 'Đực' : field.value === 'FEMALE' ? 'Cái' : undefined}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Đực</SelectItem>
                        <SelectItem value="FEMALE">Cái</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trọng lượng (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="VD: 100" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn gốc / Nơi nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên trại giống..." {...field} value={field.value || ''} />
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
                    <Textarea 
                      placeholder="Các thông tin cần lưu ý thêm..." 
                      className="resize-none" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu thông tin
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
