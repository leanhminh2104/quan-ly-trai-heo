// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMatings, createMating, updateUltrasound, createFarrowing } from '@/actions/breeding'
import { QueryBreedingInput, MatingInput, UltrasoundInput, FarrowingInput } from '@/validators/breeding'
import { toast } from 'sonner'

export function useMatings(params: QueryBreedingInput) {
  return useQuery({
    queryKey: ['matings', params],
    queryFn: async () => {
      const result = await getMatings(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateMating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: MatingInput) => {
      const result = await createMating(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Tạo phiếu phối giống thành công')
      queryClient.invalidateQueries({ queryKey: ['matings'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi tạo phiếu phối')
    },
  })
}

export function useUpdateUltrasound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UltrasoundInput) => {
      const result = await updateUltrasound(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Cập nhật siêu âm thành công')
      queryClient.invalidateQueries({ queryKey: ['matings'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi cập nhật siêu âm')
    },
  })
}

export function useCreateFarrowing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FarrowingInput) => {
      const result = await createFarrowing(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Báo đẻ thành công')
      queryClient.invalidateQueries({ queryKey: ['matings'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi báo đẻ')
    },
  })
}
