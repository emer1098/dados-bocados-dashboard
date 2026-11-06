import React from 'react'
import { Button } from './Button'

export interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    loading?: boolean
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    disabled?: boolean
  }
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryAction,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/8 ${className}`}>
      <div className="flex flex-col gap-1 max-w-2xl">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="text-3xl md:text-4xl font-bold font-cormorant text-[#1a1b21] m-0 tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14.5px] text-[#555869] m-0 truncate">
            {description}
          </p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {secondaryAction && (
            <Button
              variant="drop"
              icon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant="primary"
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
              loading={primaryAction.loading}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

