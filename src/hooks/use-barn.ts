// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBarns, createBarn, deleteBarn, getBarnById, updateBarn, getBarnHierarchy } from '@/actions/barn'
import { QueryBarnInput, CreateBarnInput, UpdateBarnInput } from '@/validators/barn'
import { toast } from 'sonner'

/**
 * Hook to fetch paginated barns
 */
export function useBarns(params: QueryBarnInput) {
  return useQuery({
    queryKey: ['barns', params],
    queryFn: async () => {
      const response = await getBarns(params)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
  })
}

/**
 * Hook to create a barn
 */
export function useCreateBarn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBarnInput) => {
      const response = await createBarn(data)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (data) => {
      toast.success(`Đã tạo chuồng ${data.name} thành công`)
      queryClient.invalidateQueries({ queryKey: ['barns'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi tạo chuồng')
    },
  })
}

/**
 * Hook to delete a barn
 */
export function useDeleteBarn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteBarn(id)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Đã xóa chuồng thành công')
      queryClient.invalidateQueries({ queryKey: ['barns'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi xóa chuồng')
    },
  })
}

/**
 * Hook to get a single barn by ID
 */
export function useBarn(id: string) {
  return useQuery({
    queryKey: ['barn', id],
    queryFn: async () => {
      const response = await getBarnById(id)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    enabled: !!id,
  })
}

/**
 * Hook to update a barn
 */
export function useUpdateBarn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateBarnInput) => {
      const response = await updateBarn(data)
      if (!response.success) throw new Error(response.error)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(`Đã cập nhật chuồng ${data.name} thành công`)
      queryClient.invalidateQueries({ queryKey: ['barns'] })
      queryClient.invalidateQueries({ queryKey: ['barn', data.id] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi cập nhật chuồng')
    },
  })
}

/**
 * Hook to get the barn hierarchy
 */
export function useBarnHierarchy() {
  return useQuery({
    queryKey: ['barnHierarchy'],
    queryFn: async () => {
      const response = await getBarnHierarchy()
      if (!response.success) throw new Error(response.error)
      return response.data
    },
  })
}
