import React, { useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Search,
  MapPin,
} from 'lucide-react'
import { ModuleConfig } from '@/lib/modules.config'
import { UserBar } from './UserBar'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'

export interface ModuleTopPillProps {
  currentModule: ModuleConfig
  onBackToHome: () => void
  onOpenModuleSwitcher: () => void
  onOpenCommandPalette: () => void
  currentBranch: string
  onChangeBranch: (branch: string) => void
  unreadAlertsCount?: number
  onOpenAlerts: () => void
  userName?: string
  userRole?: string
  onLogout: () => void
  isOnline?: boolean
  hasActiveTicket?: boolean
}

export function ModuleTopPill({
  currentModule,
  onBackToHome,
  onOpenModuleSwitcher,
  onOpenCommandPalette,
  currentBranch,
  onChangeBranch,
  unreadAlertsCount = 0,
  onOpenAlerts,
  userName = 'María Gonzales',
  userRole = 'Administradora',
  onLogout,
  isOnline = true,
  hasActiveTicket = false,
}: ModuleTopPillProps) {
  const [branchOpen, setBranchOpen] = useState(false)
  const branchRef = useOverlayBehavior<HTMLDivElement>(branchOpen, () => setBranchOpen(false), { lockScroll: false })

  return (
    <nav className="sticky top-4 z-40 w-full sm:max-w-[1500px] mx-auto px-3 sm:px-4 md:px-8 mb-6 living-slide-down">
      <div className="floating-top-pill px-3.5 py-2 flex items-center justify-between gap-2.5">
        {/* Lado izquierdo: Botón ← Inicio y Nombre de Módulo con Cambiar Módulo ▾ */}
        <div className="flex items-center gap-2">
          {/* Botón ← Inicio */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 active:scale-95 text-xs font-bold text-[#1a1b21] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
          title="Volver a la pantalla principal"
        >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          {/* Selector de Módulo actual ▾ */}
          <button
            onClick={onOpenModuleSwitcher}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/8 active:scale-95 text-[#1a1b21] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
            title="Cambiar de función"
          >
            <currentModule.icon className="w-4 h-4 text-[oklch(48%_0.16_45)] shrink-0" />
            <span className="text-xs font-bold truncate max-w-[140px] sm:max-w-none">
              {currentModule.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#555869]" />
          </button>
        </div>

        {/* Centro: Buscador global (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-black/4 hover:bg-black/8 active:scale-95 text-xs text-[#555869] border border-black/5 flex-1 max-w-xs transition-all duration-200 living-fade-up living-stagger-2"
        >
        <div className="flex items-center gap-2 living-fade-up living-stagger-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#555869]" />
            <span className="truncate">Buscar o acción...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-bold text-[#1a1b21] shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Lado derecho: Sede, Estado en línea y UserBar unificado */}
        <div className="flex items-center gap-1.5 living-fade-up living-stagger-3 min-w-0">
          {/* Lupa en móvil */}
          <button
            onClick={onOpenCommandPalette}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#555869] hover:bg-black/5 active:scale-95 md:hidden transition-all duration-200"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Selector de sede */}
          <div ref={branchRef} className="relative hidden lg:block">
            <button
              onClick={() => setBranchOpen(!branchOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#555869] hover:bg-black/5 active:scale-95 transition-all duration-200"
            >
              <MapPin className="w-3 h-3 text-[oklch(48%_0.16_45)]" />
              <span>{currentBranch}</span>
            </button>
            {branchOpen && (
              <div
                className="absolute right-0 mt-2 w-44 glass-card !p-1.5 shadow-xl flex flex-col gap-1 z-50 bg-white living-zoom-in"
              >
                {['Local Centro', 'Sede Miraflores', 'Sede San Isidro'].map((b) => (
                  <button
                    key={b}
                    onClick={() => onChangeBranch(b)}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/5"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Estado En línea */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[oklch(48%_0.16_45)] bg-[oklch(92%_0.06_55)]/30 border border-[oklch(48%_0.16_45)]/20"
            title="Base de datos y servicios sincronizados en tiempo real"
          >
            <span className="w-2 h-2 rounded-full bg-[oklch(48%_0.16_45)] animate-pulse" />
            <span className="text-[11px]">En línea</span>
          </div>

          {/* UserBar Integrado */}
          <UserBar
            userName={userName}
            userRole={userRole}
            currentBranch={currentBranch}
            unreadAlertsCount={unreadAlertsCount}
            variant="pill-light"
            hasActiveTicket={hasActiveTicket}
            onLogout={onLogout}
            onOpenAlerts={onOpenAlerts}
            onOpenShortcuts={onOpenCommandPalette}
          />
        </div>
      </div>
    </nav>
  )
}

