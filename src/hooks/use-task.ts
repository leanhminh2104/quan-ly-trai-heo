// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, completeTask, deleteTask } from '@/actions/task'
import { QueryTaskInput, CreateTaskInput, CompleteTaskInput } from '@/validators/task'
import { toast } from 'sonner'

export function useTasks(params: QueryTaskInput) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const result = await getTasks(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const result = await createTask(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Giao việc thành công')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi tạo công việc')
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CompleteTaskInput) => {
      const result = await completeTask(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái hoàn thành')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi cập nhật công việc')
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTask(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Đã xóa công việc')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi xóa công việc')
    },
  })
}
