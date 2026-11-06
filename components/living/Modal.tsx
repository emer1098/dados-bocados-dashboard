import React from 'react'
import { X } from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}: ModalProps) {
  const overlayRef = useOverlayBehavior<HTMLDivElement>(isOpen, onClose)

  if (!isOpen) return null

  return (
    <OverlayPortal>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 animate-fade-in"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto glass-card !bg-white !p-7 shadow-2xl flex flex-col gap-5 border border-black/10`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-[#555869] m-0 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 text-[#555869] hover:text-[#1a1b21] hover:bg-black/10 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col gap-5">{children}</div>
        </div>
      </div>
    </OverlayPortal>
  )
}

