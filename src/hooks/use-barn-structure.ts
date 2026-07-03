import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createBarnZone, updateBarnZone, deleteBarnZone,
  createBarnRow, updateBarnRow, deleteBarnRow,
  createBarnLoc, updateBarnLoc, deleteBarnLoc
} from '@/actions/barn-structure'
import { BarnZoneInput, BarnRowInput, BarnInput } from '@/validators/barn'

export function useCreateBarnZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBarnZone,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo khu vực thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useUpdateBarnZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: BarnZoneInput }) => updateBarnZone(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật khu vực thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useDeleteBarnZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBarnZone,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa khu vực thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useCreateBarnRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBarnRow,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo dãy chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useUpdateBarnRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: BarnRowInput }) => updateBarnRow(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật dãy chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useDeleteBarnRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBarnRow,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa dãy chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useCreateBarnLoc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBarnLoc,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo nhà chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useUpdateBarnLoc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: BarnInput }) => updateBarnLoc(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật nhà chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}

export function useDeleteBarnLoc() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBarnLoc,
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa nhà chuồng thành công')
        queryClient.invalidateQueries({ queryKey: ['barn-hierarchy'] })
      } else {
        toast.error(res.error || 'Có lỗi xảy ra')
      }
    },
    onError: (error) => toast.error(error.message || 'Lỗi hệ thống')
  })
}
