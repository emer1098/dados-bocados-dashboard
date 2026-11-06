import React from 'react'
import { MODULES_CONFIG, LIVING_GROUPS, ModuleConfig } from '@/lib/modules.config'
import { X, ArrowRight } from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface ModuleSwitcherProps {
  isOpen: boolean
  onClose: () => void
  currentModuleId: string
  onSelectModule: (module: ModuleConfig) => void
}

export function ModuleSwitcher({
  isOpen,
  onClose,
  currentModuleId,
  onSelectModule,
}: ModuleSwitcherProps) {
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
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-card !bg-white !p-6 shadow-2xl flex flex-col gap-6 border border-black/10 living-zoom-in"
        >
        <div className="flex items-center justify-between pb-3 border-b border-black/8">
          <div>
            <span className="eyebrow">NAVEGACIÓN RÁPIDA</span>
            <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
              Cambiar de Función
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 text-[#555869] hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grupos de Módulos */}
        <div className="flex flex-col gap-6">
          {LIVING_GROUPS.map((group) => {
            const modulesInGroup = MODULES_CONFIG.filter((m) => m.group === group)
            return (
              <div key={group} className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-[#555869] uppercase tracking-wider">
                  {group}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {modulesInGroup.map((mod) => {
                    const IconComp = mod.icon
                    const isCurrent = mod.id === currentModuleId
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          onSelectModule(mod)
                          onClose()
                        }}
                        className={`p-3.5 rounded-2xl flex items-center gap-3 text-left transition-all ${
                          isCurrent
                            ? 'bg-[#1a1b21] text-white shadow-md'
                            : 'bg-black/[0.03] hover:bg-black/[0.07] text-[#1a1b21]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-[oklch(92%_0.06_55)] text-[oklch(48%_0.16_45)]'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate">{mod.name}</span>
                          <span
                            className={`text-[11px] truncate ${
                              isCurrent ? 'text-white/70' : 'text-[#555869]'
                            }`}
                          >
                            {mod.shortDescription}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
    </OverlayPortal>
  )
}

