// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '@/actions/employee'
import { QueryEmployeeInput, CreateEmployeeInput, UpdateEmployeeInput } from '@/validators/employee'
import { toast } from 'sonner'

export function useEmployees(params: QueryEmployeeInput) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const res = await getEmployees(params)
      if (!res.success) throw new Error(res.error)
      return res.data
    }
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const res = await createEmployee(data)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      toast.success('Đã thêm nhân viên thành công')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra khi thêm nhân viên')
    }
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateEmployeeInput) => {
      const res = await updateEmployee(data)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật')
    }
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteEmployee(id)
      if (!res.success) throw new Error(res.error)
      return res.data
    },
    onSuccess: () => {
      toast.success('Đã xóa nhân viên thành công')
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (err) => {
      toast.error(err.message || 'Có lỗi xảy ra khi xóa')
    }
  })
}
