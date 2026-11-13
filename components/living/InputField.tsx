import React, { forwardRef } from 'react'

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  leftIcon?: React.ReactNode
  prefixText?: string
  suffixText?: string
  shortcut?: string
  rightButton?: React.ReactNode
  rightAction?: React.ReactNode
  helperText?: string
  error?: string
  containerClassName?: string
}

/**
 * InputField: Componente único de entrada de datos según especificación Living.
 * - Zonas separadas: [icono/prefijo] [texto] [final/botón/sufijo]
 * - Altura fija de 48px (h-12 / min-h-[48px])
 * - Padding izquierdo: 44px (o 80px si combina icono + prefijo)
 * - Padding derecho: 44px (o 80px si hay atajo como Ctrl+K o sufijo largo)
 * - Botones finales de 44x44px con centrado táctil
 * - Neutralización de fondo de autocompletado del navegador
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      icon,
      leftIcon,
      prefixText,
      suffixText,
      shortcut,
      rightButton,
      rightAction,
      helperText,
      error,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const activeLeftIcon = leftIcon || icon
    const activeRightAction = rightAction || rightButton
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined)

    // Cálculo estricto de padding izquierdo para evitar superposición
    let paddingLeftClass = 'pl-4'
    if (activeLeftIcon && prefixText) {
      paddingLeftClass = 'pl-[80px]'
    } else if (activeLeftIcon) {
      paddingLeftClass = 'pl-[44px]'
    } else if (prefixText) {
      paddingLeftClass = 'pl-[44px]'
    }

    // Cálculo estricto de padding derecho
    let paddingRightClass = 'pr-4'
    if (shortcut || (suffixText && suffixText.length > 2)) {
      paddingRightClass = 'pr-[80px]'
    } else if (activeRightAction || suffixText) {
      paddingRightClass = 'pr-[44px]'
    }

    return (
      <div className="flex flex-col gap-1.5 w-full ${containerClassName}">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[var(--ink)] select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {/* Zona Izquierda: Icono y/o Prefijo de unidad */}
          {activeLeftIcon && (
            <span
              className="absolute left-0 top-0 w-11 h-12 flex items-center justify-center text-[var(--ink-soft)] pointer-events-none z-10"
              aria-hidden="true"
            >
              {activeLeftIcon}
            </span>
          )}

          {prefixText && (
            <span
              className={`absolute ${activeLeftIcon ? 'left-11' : 'left-0'} top-0 ${activeLeftIcon ? 'w-8' : 'w-11'} h-12 flex items-center justify-center text-xs font-bold text-[var(--ink-soft)] pointer-events-none z-10 select-none`}
              aria-hidden="true"
            >
              {prefixText}
            </span>
          )}

          {/* Campo de texto con altura de 48px y neutralización de autocompletado */}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-12 min-h-[48px] rounded-2xl bg-[#14151d]
              border border-[var(--card-border)] text-[var(--ink)] text-sm
              transition-all duration-150 outline-none
              placeholder:text-[var(--ink-soft)]/60
              focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-glow)]
              ${paddingLeftClass}
              ${paddingRightClass}
              ${error ? '!border-[#b91c1c] !ring-1 !ring-[#b91c1c]' : ''}
              [&:-webkit-autofill]:shadow-[0_0_0_1000px_#14151d_inset]
              [&:-webkit-autofill]:[-webkit-text-fill-color:#f5f5f7]
              [&:-webkit-autofill:focus]:shadow-[0_0_0_1000px_#14151d_inset]
              ${className}
            `}
            {...props}
          />

          {/* Zona Derecha: Botón interactivo (44x44px), atajo de teclado o sufijo */}
          {activeRightAction && (
            <div className="absolute right-0 top-0 w-11 h-12 flex items-center justify-center z-10">
              {activeRightAction}
            </div>
          )}

          {shortcut && !activeRightAction && (
            <div className="absolute right-3 top-0 h-12 flex items-center pointer-events-none z-10">
              <kbd className="px-2 py-0.5 rounded-md bg-black/5 border border-black/10 text-[10.5px] font-medium text-[#555869] tracking-wider select-none">
                {shortcut}
              </kbd>
            </div>
          )}

          {suffixText && !activeRightAction && !shortcut && (
            <span
              className="absolute right-0 top-0 w-11 h-12 flex items-center justify-center text-xs font-semibold text-[#555869] pointer-events-none z-10 select-none"
              aria-hidden="true"
            >
              {suffixText}
            </span>
          )}
        </div>

        {/* Mensaje de error o texto de ayuda (máx 60 caracteres) */}
        {error ? (
          <span className="text-xs font-medium text-[#b91c1c] leading-tight">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#555869] leading-tight line-clamp-1">{helperText}</span>
        ) : null}
      </div>
    )
  }
)

InputField.displayName = 'InputField'
export default InputField

