// Bản quyền thuộc dalymmo.com
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: ReactNode
  }
  children?: React.ReactNode
  className?: string
}

/**
 * Standard page header with title, description, and optional action button
 */
export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 text-sm font-medium text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all"
            >
              {action.icon ? action.icon : <Plus className="h-4 w-4" />}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 text-sm font-medium text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all"
            >
              {action.icon ? action.icon : <Plus className="h-4 w-4" />}
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}
