import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'drop' | 'drop-video' | 'ghost' | 'danger'
  icon?: React.ReactNode
  loading?: boolean
}

export function Button({
  variant = 'primary',
  icon,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary-living',
    drop: 'btn-drop-living',
    'drop-video': 'btn-drop-video',
    ghost: 'btn-ghost-living',
    danger: 'btn-danger-living',
  }[variant]

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex items-center shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}

