// Bản quyền thuộc dalymmo.com
import { useQuery } from '@tanstack/react-query'
import { getSummaryStats, getFinancialStats, getPopulationStats } from '@/actions/report'

export function useSummaryStats() {
  return useQuery({
    queryKey: ['report', 'summary'],
    queryFn: async () => {
      const result = await getSummaryStats()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useFinancialStats(year: number) {
  return useQuery({
    queryKey: ['report', 'financial', year],
    queryFn: async () => {
      const result = await getFinancialStats(year)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function usePopulationStats() {
  return useQuery({
    queryKey: ['report', 'population'],
    queryFn: async () => {
      const result = await getPopulationStats()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}
