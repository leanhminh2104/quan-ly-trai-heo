// Bản quyền thuộc dalymmo.com
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs, getAuditEntities } from '@/actions/audit-log'
import { QueryAuditLogInput } from '@/validators/audit-log'

export function useAuditLogs(params: QueryAuditLogInput) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const result = await getAuditLogs(params)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useAuditEntities() {
  return useQuery({
    queryKey: ['audit-entities'],
    queryFn: async () => {
      const result = await getAuditEntities()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
