import React from 'react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center living-card !border-dashed gap-3.5">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[oklch(92%_0.06_55)] text-[oklch(48%_0.16_45)] flex items-center justify-center mb-1">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
        {title}
      </h3>
      <p className="text-sm text-[#555869] max-w-md m-0 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

