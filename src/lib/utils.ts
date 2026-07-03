// Bản quyền thuộc dalymmo.com
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

/**
 * Merge TailwindCSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: vi })
}

/**
 * Format date time to Vietnamese locale
 */
export function formatDateTime(date: Date | string) {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })
}

/**
 * Format relative time (e.g., "2 ngày trước")
 */
export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(num: number, decimals: number = 0) {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format currency (VNĐ)
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format weight (kg)
 */
export function formatWeight(kg: number) {
  return `${formatNumber(kg, 1)} kg`
}

/**
 * Generate a random color for markers
 */
export function generateColor() {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a structured API response type
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
