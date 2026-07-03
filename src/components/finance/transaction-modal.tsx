'use client'
// Bản quyền thuộc dalymmo.com

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createIncome, createExpense } from '@/actions/finance'
import { incomeSchema, expenseSchema, IncomeInput, ExpenseInput } from '@/validators/finance'
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
import { Loader2, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { IncomeType, ExpenseType } from '@prisma/client'

const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  PIG_SALE: 'Bán lợn',
  MANURE_SALE: 'Bán phân',
  OTHER_INCOME: 'Thu khác',
}

const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  FEED: 'Thức ăn',
  MEDICINE: 'Thuốc',
  VACCINE: 'Vaccine',
  SEMEN: 'Tinh giống',
  ELECTRICITY: 'Điện',
  WATER: 'Nước',
  SALARY: 'Lương',
  DEPRECIATION: 'Khấu hao',
  REPAIR: 'Sửa chữa',
  SUPPLIES: 'Vật tư',
  OTHER: 'Chi khác',
}

interface TransactionModalProps {
  type: 'income' | 'expense'
}

export function TransactionModal({ type }: TransactionModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const isIncome = type === 'income'

  // Income form
  const incomeForm = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema) as any,
    defaultValues: {
      type: 'PIG_SALE',
      amount: 0,
      date: new Date(),
    },
  })

  // Expense form
  const expenseForm = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      type: 'FEED',
      amount: 0,
      date: new Date(),
    },
  })

  const form = (isIncome ? incomeForm : expenseForm) as any

  const onSubmit = async (data: any) => {
    try {
      const res = isIncome
        ? await createIncome(data as IncomeInput)
        : await createExpense(data as ExpenseInput)
      if (res.success) {
        toast.success(`Tạo phiếu ${isIncome ? 'Thu' : 'Chi'} thành công`)
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        setOpen(false)
        form.reset()
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const typeOptions = isIncome
    ? Object.entries(INCOME_TYPE_LABELS)
    : Object.entries(EXPENSE_TYPE_LABELS)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className={isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
          {isIncome ? <ArrowDownRight className="w-4 h-4 mr-2" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
          Lập phiếu {isIncome ? 'Thu' : 'Chi'}
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Phiếu {isIncome ? 'Thu' : 'Chi'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại">
                          {typeOptions.find(([key]) => key === field.value)?.[1]}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map(([key, label]) => (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền (VNĐ) <span className="text-red-500">*</span></FormLabel>
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày giao dịch <span className="text-red-500">*</span></FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Diễn giải..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className={isIncome ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}>
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu phiếu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
