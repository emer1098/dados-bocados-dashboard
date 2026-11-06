import React from 'react'
import { ArrowRight } from 'lucide-react'
import { ModuleConfig, LiveDataArgs } from '@/lib/modules.config'

export interface ModuleCardProps {
  module: ModuleConfig
  liveArgs: LiveDataArgs
  onClick: () => void
}

export function ModuleCard({ module, liveArgs, onClick }: ModuleCardProps) {
  const IconComp = module.icon
  const rawLiveData = module.getLiveData(liveArgs)

  // Tratamiento humano del dato en vivo (especialmente para el cero)
  let humanLiveData = rawLiveData
  if (module.id === 'ventas' && (!liveArgs.salesCount || liveArgs.salesCount === 0)) {
    humanLiveData = 'Sin ventas aún hoy'
  } else if (module.id === 'mesas' && (!liveArgs.activeTablesCount || liveArgs.activeTablesCount === 0)) {
    humanLiveData = 'Todas las mesas libres'
  } else if (module.id === 'alertas' && (!liveArgs.lowIngredientsCount || liveArgs.lowIngredientsCount === 0)) {
    humanLiveData = 'Stock en nivel óptimo'
  }

  // Asegurar que la descripción sea concisa (≤ 70 caracteres) sin puntos suspensivos
  const cleanDescription = module.shortDescription.length > 70
    ? module.shortDescription.slice(0, 67).trim() + '.'
    : module.shortDescription

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className="living-card living-card-interactive bloom p-5 flex flex-col justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)] group cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icono en círculo moss */}
        <div className="moss-icon-circle shrink-0">
          <IconComp className="w-5 h-5 text-[oklch(48%_0.16_45)]" />
        </div>

        {/* Flecha elegante de acceso (sin texto redundante) */}
        <div className="w-7 h-7 rounded-full bg-black/4 group-hover:bg-[oklch(48%_0.16_45)] group-hover:text-white text-[#555869] flex items-center justify-center transition-colors">
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0 leading-tight">
          {module.name}
        </h3>
        <p className="text-xs text-[#555869] m-0 line-clamp-2 leading-relaxed">
          {cleanDescription}
        </p>
      </div>

      {/* Dato en vivo abajo, bien visible con lenguaje humano */}
      {humanLiveData && (
        <div className="pt-2.5 border-t border-black/6 flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-[oklch(48%_0.16_45)] bg-[oklch(92%_0.06_55)]/30 px-2.5 py-0.5 rounded-full tabular-nums">
            {humanLiveData}
          </span>
        </div>
      )}
    </div>
  )
}
