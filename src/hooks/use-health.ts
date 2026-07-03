// Bản quyền thuộc dalymmo.com
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVaccinations, createVaccination, getTreatments, createTreatment } from '@/actions/health'
import { QueryHealthInput, VaccinationInput, TreatmentInput } from '@/validators/health'
import { toast } from 'sonner'

export function useVaccinations(params: QueryHealthInput) {
  return useQuery({
    queryKey: ['vaccinations', params],
    queryFn: async () => {
      const result = await getVaccinations(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateVaccination() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: VaccinationInput) => {
      const result = await createVaccination(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Thêm bản ghi tiêm phòng thành công')
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    },
  })
}

export function useTreatments(params: QueryHealthInput) {
  return useQuery({
    queryKey: ['treatments', params],
    queryFn: async () => {
      const result = await getTreatments(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useCreateTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TreatmentInput) => {
      const result = await createTreatment(data)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      toast.success('Thêm hồ sơ điều trị thành công')
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Lỗi khi lưu dữ liệu')
    },
  })
}
