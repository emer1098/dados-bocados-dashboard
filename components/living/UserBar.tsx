import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  LogOut,
  User,
  Settings,
  Keyboard,
  Shield,
  ChevronDown,
  AlertTriangle,
  X,
} from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface UserBarProps {
  userName: string
  userRole: string
  currentBranch: string
  unreadAlertsCount?: number
  variant?: 'floating-dark' | 'pill-light'
  hasActiveTicket?: boolean
  onLogout: () => void
  onOpenAlerts?: () => void
  onOpenShortcuts?: () => void
}

export function UserBar({
  userName,
  userRole,
  currentBranch,
  unreadAlertsCount = 0,
  variant = 'pill-light',
  hasActiveTicket = false,
  onLogout,
  onOpenAlerts,
  onOpenShortcuts,
}: UserBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmLogoutModal, setConfirmLogoutModal] = useState(false)
  const logoutModalRef = useOverlayBehavior<HTMLDivElement>(confirmLogoutModal, () => setConfirmLogoutModal(false))
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const initial = userName.trim().charAt(0).toUpperCase() || 'U'

  // Accesibilidad de teclado: Esc cierra el menú
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && dropdownOpen) {
        setDropdownOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dropdownOpen])

  // Clic fuera cierra el menú
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleLogoutClick = () => {
    setDropdownOpen(false)
    if (hasActiveTicket) {
      setConfirmLogoutModal(true)
    } else {
      onLogout()
    }
  }

  const isDark = variant === 'floating-dark'

  return (
    <>
      <div className="relative flex items-center gap-2" ref={menuRef}>
        {/* Campana de Notificaciones / Alertas */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`relative p-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)] ${
            isDark
              ? 'bg-black/40 hover:bg-black/60 text-white/90 border border-white/15'
              : 'hover:bg-black/5 text-[#555869]'
          }`}
          title={`${unreadAlertsCount} alertas activas`}
          aria-label="Ver alertas"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#b91c1c] ring-2 ring-white" />
          )}
        </button>

        {/* Trigger del Menú de Usuario */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)] ${
            isDark
              ? 'bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md shadow-md'
              : 'hover:bg-black/5 text-[#1a1b21]'
          }`}
        >
          {/* Avatar con la inicial */}
          <div
            className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
              isDark
                ? 'bg-[oklch(48%_0.16_45)] text-white'
                : 'bg-[#1a1b21] text-white'
            }`}
          >
            {initial}
          </div>

          {/* Nombre y Rol en pantallas medianas hacia arriba */}
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span
              className={`text-xs font-bold truncate max-w-[130px] ${
                isDark ? 'text-white' : 'text-[#1a1b21]'
              }`}
            >
              {userName}
            </span>
            <span
              className={`text-[10px] font-medium truncate ${
                isDark ? 'text-white/70' : 'text-[#555869]'
              }`}
            >
              {userRole}
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            } ${isDark ? 'text-white/70' : 'text-[#555869]'}`}
          />
        </button>

        {/* Menú Desplegable Accesible */}
        {dropdownOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white border border-black/10 shadow-2xl p-2 z-50 text-[#1a1b21] animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Cabecera con datos del usuario */}
            <div className="p-3 bg-black/[0.03] rounded-2xl mb-1.5 flex flex-col gap-0.5">
              <span className="text-xs font-bold text-[#1a1b21] truncate">{userName}</span>
              <span className="text-[11px] text-[#555869] font-medium truncate">
                {userRole} · {currentBranch}
              </span>
              <span className="text-[10px] text-[oklch(48%_0.16_45)] font-bold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(48%_0.16_45)] animate-pulse" />
                Sesión activa en tablet
              </span>
            </div>

            {/* Opciones */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setDropdownOpen(false)
                alert(`Perfil de usuario:\nNombre: ${userName}\nRol: ${userRole}\nSede: ${currentBranch}`)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-black/5 text-[#1a1b21] transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-[#555869]" />
              <span>Mi perfil</span>
            </button>

            {onOpenShortcuts && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false)
                  onOpenShortcuts()
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl hover:bg-black/5 text-[#1a1b21] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-3.5 h-3.5 text-[#555869]" />
                  <span>Atajos de teclado</span>
                </div>
                <kbd className="px-1.5 py-0.5 rounded bg-black/5 text-[10px] text-[#555869] font-mono">
                  Ctrl K
                </kbd>
              </button>
            )}

            <div className="h-px bg-black/6 my-1" />

            {/* Cerrar Sesión */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-[#b91c1c] hover:bg-[#fee2e2]/70 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmación si hay ticket activo */}
      {confirmLogoutModal && (
        <OverlayPortal>
          <div ref={logoutModalRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 ">
            <div className="glass-card !bg-white max-w-sm w-full !p-6 flex flex-col gap-4 text-center living-zoom-in">
            <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
                Ticket pendiente
              </h3>
              <p className="text-xs text-[#555869] mt-1">
                Tienes un ticket de venta abierto sin cobrar. ¿Deseas cerrar sesión de todos modos?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmLogoutModal(false)
                  onLogout()
                }}
                className="flex-1 px-4 py-2 rounded-full text-xs font-bold bg-[#b91c1c] text-white hover:opacity-90 transition-opacity"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}
    </>
  )
}

