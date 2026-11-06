'use client'

import { useEffect, useRef } from 'react'

export interface UseOverlayOptions {
  escape?: boolean
  outsideClick?: boolean
  lockScroll?: boolean
}

export function useOverlayBehavior<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
  options: UseOverlayOptions = {}
) {
  const { escape = true, outsideClick = true, lockScroll = true } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!isOpen) return

    const listeners: Array<[string, EventListener]> = []

    if (escape) {
      const onKey = (e: Event) => {
        if ((e as KeyboardEvent).key === 'Escape') onClose()
      }
      document.addEventListener('keydown', onKey)
      listeners.push(['keydown', onKey])
    }

    if (outsideClick) {
      const onMouseDown = (e: Event) => {
        if (ref.current && !ref.current.contains(e.target as Node)) onClose()
      }
      document.addEventListener('mousedown', onMouseDown)
      listeners.push(['mousedown', onMouseDown])
    }

    let restoreOverflow: string | null = null
    if (lockScroll && document.body.style.overflow !== 'hidden') {
      restoreOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }

    return () => {
      listeners.forEach(([type, handler]) => document.removeEventListener(type, handler))
      if (restoreOverflow !== null) document.body.style.overflow = restoreOverflow
    }
  }, [isOpen, onClose, escape, outsideClick, lockScroll])

  return ref
}
