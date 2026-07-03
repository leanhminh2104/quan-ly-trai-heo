// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransactions, createTransaction } from '@/actions/finance'
import { QueryFinanceInput, TransactionInput } from '@/validators/finance'
import { toast } from 'sonner'

export function useTransactions(params: QueryFinanceInput) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const result = await getTransactions(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TransactionInput) => {
      const result = await createTransaction(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Ghi nhận giao dịch thành công')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    },
  })
}
