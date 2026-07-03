// Bản quyền thuộc dalymmo.com
import { UserRole, PigStatus, PigType, PigGender, PenStatus, PenType } from '@prisma/client'

/**
 * Common API response type
 */
export type ActionResponse<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Filter option for data tables
 */
export interface FilterOption {
  label: string
  value: string
  icon?: string
}

/**
 * Current user context
 */
export type { CurrentUser } from '@/lib/auth'

/**
 * Navigation item type
 */
export interface NavItem {
  title: string
  href: string
  icon: string
  children?: { title: string; href: string }[]
  permission?: string
}

/**
 * Select option (for dropdowns)
 */
export interface SelectOption {
  label: string
  value: string
}

/**
 * Date range filter
 */
export interface DateRange {
  from: Date
  to: Date
}

/**
 * Export format options
 */
export type ExportFormat = 'excel' | 'pdf'

/**
 * Re-export Prisma enums for convenience
 */
export {
  UserRole,
  PigStatus,
  PigType,
  PigGender,
  PenStatus,
  PenType,
}
