import React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  options?: { value: string; label: string }[]
  children?: React.ReactNode
}

export function Select({
  label,
  helperText,
  error,
  options,
  children,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#1a1b21]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`living-select ${error ? '!border-[#b91c1c]' : ''} ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error ? (
        <span className="text-xs font-medium text-[#b91c1c]">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#555869]">{helperText}</span>
      ) : null}
    </div>
  )
}

