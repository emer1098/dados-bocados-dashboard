import React from 'react'

export interface BadgeProps {
  variant?: 'ok' | 'warn' | 'err' | 'neutral'
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = 'neutral',
  icon,
  children,
  className = '',
}: BadgeProps) {
  const variantClass = {
    ok: 'badge-ok',
    warn: 'badge-warn',
    err: 'badge-err',
    neutral: 'badge-neutral-living',
  }[variant]

  const defaultIcon = {
    ok: '●',
    warn: '▲',
    err: '■',
    neutral: '✦',
  }[variant]

  return (
    <span className={`living-badge ${variantClass} ${className}`}>
      <span className="shrink-0 text-[10px] leading-none">{icon || defaultIcon}</span>
      <span>{children}</span>
    </span>
  )
}

