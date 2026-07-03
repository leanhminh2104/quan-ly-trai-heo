// Bản quyền thuộc dalymmo.com
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getDashboardAlerts, getUpcomingTasks, getDashboardRecentActivities } from '@/actions/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const result = await getDashboardStats()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => {
      const result = await getDashboardAlerts()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useUpcomingTasks() {
  return useQuery({
    queryKey: ['upcoming-tasks'],
    queryFn: async () => {
      const result = await getUpcomingTasks()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}

export function useDashboardRecentActivities() {
  return useQuery({
    queryKey: ['dashboard-recent-activities'],
    queryFn: async () => {
      const result = await getDashboardRecentActivities()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
  })
}
