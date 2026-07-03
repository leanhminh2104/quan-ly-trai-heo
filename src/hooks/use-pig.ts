// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPigs, getPigDetails, createPig, deletePig } from '@/actions/pig'
import { QueryPigInput, CreatePigInput } from '@/validators/pig'
import { toast } from 'sonner'

export function usePigs(params: QueryPigInput) {
  return useQuery({
    queryKey: ['pigs', params],
    queryFn: async () => {
      const result = await getPigs(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function usePig(id: string) {
  return useQuery({
    queryKey: ['pig', id],
    queryFn: async () => {
      const result = await getPigDetails(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    enabled: !!id,
  })
}

export function useCreatePig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreatePigInput) => {
      const result = await createPig(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Thêm cá thể lợn thành công')
      queryClient.invalidateQueries({ queryKey: ['pigs'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi thêm lợn')
    },
  })
}

export function useUpdatePig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      // Import missing updatePig from actions at the top if needed.
      // Wait, let's just make sure we update actions.
      const { updatePig } = await import('@/actions/pig')
      const result = await updatePig(id, data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (_, variables) => {
      toast.success('Cập nhật cá thể thành công')
      queryClient.invalidateQueries({ queryKey: ['pigs'] })
      queryClient.invalidateQueries({ queryKey: ['pig', variables.id] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi cập nhật')
    },
  })
}

export function useDeletePig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePig(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Xóa cá thể lợn thành công')
      queryClient.invalidateQueries({ queryKey: ['pigs'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi xóa')
    },
  })
}
