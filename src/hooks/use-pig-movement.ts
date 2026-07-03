// Bản quyền thuộc dalymmo.com

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { movePig } from '@/actions/pig-movement'
import { toast } from 'sonner'

/**
 * Hook để chuyển lợn giữa các ô chuồng.
 * Tự động invalidate cache hierarchy sau khi chuyển thành công.
 */
export function useMovePig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: movePig,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error('Lỗi chuyển lợn', { description: result.error })
        return
      }
      toast.success('Đã chuyển lợn thành công')
      queryClient.invalidateQueries({ queryKey: ['barnHierarchy'] })
      queryClient.invalidateQueries({ queryKey: ['barns'] })
    },
    onError: () => {
      toast.error('Đã có lỗi xảy ra khi chuyển lợn')
    }
  })
}
