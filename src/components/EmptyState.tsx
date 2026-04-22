import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-reno-100 text-reno-500 dark:bg-reno-800 dark:text-reno-300">
        {icon ?? <PackageOpen className="h-5 w-5" />}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-bold text-reno-900 dark:text-white">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-xs leading-6 text-reno-500 dark:text-reno-400">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
