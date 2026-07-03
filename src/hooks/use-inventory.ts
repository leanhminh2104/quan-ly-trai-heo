// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeedStocks, createFeedStock, getMedicineStocks, createMedicineStock } from '@/actions/inventory'
import { QueryInventoryInput, FeedStockInput, MedicineStockInput } from '@/validators/inventory'
import { toast } from 'sonner'

export function useFeedStocks(params: QueryInventoryInput) {
  return useQuery({
    queryKey: ['feedStocks', params],
    queryFn: async () => {
      const result = await getFeedStocks(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateFeedStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FeedStockInput) => {
      const result = await createFeedStock(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Nhập kho cám thành công')
      queryClient.invalidateQueries({ queryKey: ['feedStocks'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    },
  })
}

export function useMedicineStocks(params: QueryInventoryInput) {
  return useQuery({
    queryKey: ['medicineStocks', params],
    queryFn: async () => {
      const result = await getMedicineStocks(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateMedicineStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: MedicineStockInput) => {
      const result = await createMedicineStock(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Nhập kho thuốc thành công')
      queryClient.invalidateQueries({ queryKey: ['medicineStocks'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    },
  })
}
