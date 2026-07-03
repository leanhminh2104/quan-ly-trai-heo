// Bản quyền thuộc dalymmo.com
import { cn } from '@/lib/utils'
import { FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ElementType
  action?: {
    label: string
    onClick?: () => void
  }
  className?: string
}

/**
 * Empty state display when no data is available
 */
export function EmptyState({
  title = 'Không có dữ liệu',
  description = 'Chưa có dữ liệu nào được thêm vào.',
  icon: Icon = FileQuestion,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
