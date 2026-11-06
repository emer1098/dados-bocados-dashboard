'use client'

import React, { useState } from 'react'
import {
  Search,
  MapPin,
  Plus,
  Gamepad2,
  UtensilsCrossed,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import { MODULES_CONFIG, ModuleConfig, LiveDataArgs } from '@/lib/modules.config'
import { ModuleCard } from './ModuleCard'
import { Button } from './Button'
import { UserBar } from './UserBar'

export interface HomeCenteredViewProps {
  userName: string
  userRole: string
  currentBranch: string
  onChangeBranch: (b: string) => void
  onOpenCommandPalette: () => void
  onSelectModule: (module: ModuleConfig) => void
  onQuickAction: (actionKey: string) => void
  onLogout: () => void
  liveArgs: LiveDataArgs
  recentModules?: ModuleConfig[]
}

// 4 Etapas Profesionales del Flujo Real del Negocio
const BUSINESS_STAGES = [
  {
    key: 'abastecer',
    stepNumber: '1',
    title: 'ABASTECER',
    moduleIds: ['ingredientes', 'alertas'],
    getHealthBadge: (args: LiveDataArgs) => {
      const low = args.lowIngredientsCount ?? 0
      if (low > 0) return { text: `${low} ingredientes por reponer`, isAlert: true }
      return { text: 'Stock óptimo', isAlert: false }
    },
  },
  {
    key: 'preparar',
    stepNumber: '2',
    title: 'PREPARAR',
    moduleIds: ['cocina'],
    getHealthBadge: (args: LiveDataArgs) => {
      const ready = args.readyRecipesCount ?? 0
      const total = args.totalRecipesCount ?? 18
      return { text: `${ready} de ${total} recetas listas`, isAlert: ready < total * 0.5 }
    },
  },
  {
    key: 'vender',
    stepNumber: '3',
    title: 'VENDER',
    moduleIds: ['catalogo', 'ventas', 'mesas'],
    getHealthBadge: (args: LiveDataArgs) => {
      const busy = args.activeTablesCount ?? 0
      const sales = args.salesCount ?? 0
      if (sales === 0) return { text: 'Caja sin movimientos', isAlert: false }
      return { text: `${busy} mesas ocupadas · ${sales} tickets`, isAlert: false }
    },
  },
  {
    key: 'controlar',
    stepNumber: '4',
    title: 'CONTROLAR',
    moduleIds: ['resumen', 'finanzas', 'reportes'],
    getHealthBadge: (args: LiveDataArgs) => {
      const total = args.totalSales ?? 0
      return { text: `S/ ${total.toFixed(2)} acumulados`, isAlert: false }
    },
  },
]

export function HomeCenteredView({
  userName,
  userRole,
  currentBranch,
  onChangeBranch,
  onOpenCommandPalette,
  onSelectModule,
  onQuickAction,
  onLogout,
  liveArgs,
}: HomeCenteredViewProps) {
  // Saludo según hora en zona America/Lima
  const nowInLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  const currentHour = nowInLima.getHours()

  const greetingTime =
    currentHour >= 5 && currentHour < 12
      ? 'Buenos días'
      : currentHour >= 12 && currentHour < 19
      ? 'Buenas tardes'
      : 'Buenas noches'

  // Fecha completa en español
  const dateFormatted = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(nowInLima)

  const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)

  // Primeros Pasos: Checklist dinámico
  const stepIngredientsDone = (liveArgs.lowIngredientsCount !== undefined) && (liveArgs.readyRecipesCount ?? 0) > 0
  const stepRecipesDone = (liveArgs.readyRecipesCount ?? 0) > 0
  const stepProductsDone = (liveArgs.productsCount ?? 0) > 0
  const stepFirstSaleDone = (liveArgs.salesCount ?? 0) > 0
  const allStepsCompleted = stepIngredientsDone && stepRecipesDone && stepProductsDone && stepFirstSaleDone

  // Módulo de configuración
  const configModule = MODULES_CONFIG.find((m) => m.id === 'configuracion')

  return (
    <div className="w-full flex flex-col items-center gap-10 pb-20">
      {/* 1. HERO CON VIDEO Y CONTRASTE AA BLANCO */}
      <div className="relative w-full hero-compact flex flex-col items-center justify-center text-center p-6 sm:p-10">
        {/* Fondo cinematográfico (imagen, sin video para evitar errores de carga) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80)' }}
          />

          {/* Degradado oscuro superior y viñeta para contraste AA */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-[#f8f9fb]" />
        </div>

        {/* USERBAR FLOTANTE ARRIBA A LA DERECHA */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30">
          <UserBar
            userName={userName}
            userRole={userRole}
            currentBranch={currentBranch}
            unreadAlertsCount={liveArgs.lowIngredientsCount}
            variant="floating-dark"
            onLogout={onLogout}
            onOpenAlerts={() => onQuickAction('alertas')}
            onOpenShortcuts={onOpenCommandPalette}
          />
        </div>

        {/* Contenido centrado en blanco legible */}
        <div className="relative z-10 living-bloom flex flex-col items-center gap-3.5 max-w-2xl mt-4">
          {/* Logotipo de la marca */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/80 shadow-xl bg-black/40 mb-0.5">
            <img
              src="/logo.jpg"
              alt="Dados & Bocados"
              className="w-full h-full object-cover"
            />
          </div>

          <span className="text-xs font-bold text-white/95 uppercase tracking-[0.18em] drop-shadow-sm" suppressHydrationWarning>
            {dateCapitalized}
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold font-cormorant text-white m-0 tracking-tight leading-tight drop-shadow-md" suppressHydrationWarning>
            {greetingTime}, {userName.split(' ')[0]}
          </h1>

          <p className="text-base sm:text-lg font-medium text-white/95 m-0 drop-shadow-sm">
            ¿Qué quieres hacer hoy?
          </p>

          {/* Buscador grande centrado (Ctrl+K), Sede y Estado En línea */}
          <div className="flex items-center gap-2.5 mt-2 flex-wrap justify-center">
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center justify-between gap-4 px-5 py-2.5 rounded-full bg-white text-[#1a1b21] shadow-xl border border-white/60 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
            >
              <div className="flex items-center gap-2.5 text-[#555869]">
                <Search className="w-4 h-4" />
                <span>Buscar función, producto o receta...</span>
              </div>
              <kbd className="px-2 py-0.5 rounded bg-black/5 text-[10px] font-bold text-[#1a1b21]">
                Ctrl K
              </kbd>
            </button>

            {/* Selector de Sede */}
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-[#1a1b21] border border-white/40 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[oklch(48%_0.16_45)]" />
              <span>{currentBranch}</span>
            </div>

            {/* Estado En línea */}
            <div
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-[oklch(48%_0.16_45)] border border-white/40 shadow-sm"
              title="Base de datos y servicios en línea"
            >
              <span className="w-2 h-2 rounded-full bg-[oklch(48%_0.16_45)] animate-pulse" />
              <span>En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACCESOS RÁPIDOS */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap -mt-6 z-20">
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onQuickAction('ventas')}
          className="shadow-md"
        >
          Nueva venta
        </Button>

        <Button
          variant="drop"
          icon={<Gamepad2 className="w-4 h-4 text-[oklch(48%_0.16_45)]" />}
          onClick={() => onQuickAction('mesas')}
        >
          Ver mesas
        </Button>

        <Button
          variant="drop"
          icon={<UtensilsCrossed className="w-4 h-4 text-[oklch(48%_0.16_45)]" />}
          onClick={() => onQuickAction('ingredientes')}
        >
          Ingredientes
        </Button>
      </div>

      {/* 3. ALERTA ACCIONABLE (Solo si hay stock bajo) */}
      {(liveArgs.lowIngredientsCount ?? 0) > 0 && (
        <div className="w-full max-w-4xl p-3.5 rounded-2xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#b45309] shrink-0" />
            <p className="text-xs font-semibold text-[#1a1b21] m-0">
              {liveArgs.lowIngredientsCount} ingredientes requieren reposición
            </p>
          </div>

          <button
            onClick={() => onQuickAction('alertas')}
            className="text-xs font-bold text-[#b45309] hover:underline"
          >
            Ver alertas →
          </button>
        </div>
      )}

      {/* 4. CUADRÍCULA SIMÉTRICA DE 4 INDICADORES (4 cols desktop, 2x2 tablet, 1 móvil) */}
      <div className="w-full max-w-7xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onQuickAction('ventas')}
            className="living-card p-4 flex flex-col gap-1 text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
              Ventas de hoy
            </span>
            <span className="text-2xl font-bold text-[#1a1b21] tabular-nums">
              S/ {(liveArgs.totalSales || 0).toFixed(2)}
            </span>
            <span className="text-[11px] text-[#555869]">
              {liveArgs.salesCount ? `${liveArgs.salesCount} tickets registrados` : 'Sin ventas aún hoy'}
            </span>
          </button>

          <button
            onClick={() => onQuickAction('mesas')}
            className="living-card p-4 flex flex-col gap-1 text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
              Mesas ocupadas
            </span>
            <span className="text-2xl font-bold text-[#1a1b21] tabular-nums">
              {liveArgs.activeTablesCount || 0} de {liveArgs.totalTablesCount || 6}
            </span>
            <span className="text-[11px] text-[#555869]">
              {liveArgs.activeTablesCount === 0 ? 'Todas las mesas libres' : 'En partida activa'}
            </span>
          </button>

          <button
            onClick={() => onQuickAction('alertas')}
            className="living-card p-4 flex flex-col gap-1 text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
              Ingredientes en alerta
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                (liveArgs.lowIngredientsCount || 0) > 0 ? 'text-[#b91c1c]' : 'text-[oklch(48%_0.16_45)]'
              }`}
            >
              {liveArgs.lowIngredientsCount || 0}
            </span>
            <span className="text-[11px] text-[#555869]">
              {(liveArgs.lowIngredientsCount || 0) > 0 ? 'Requiere reposición' : 'Stock en nivel óptimo'}
            </span>
          </button>

          <button
            onClick={() => onQuickAction('cocina')}
            className="living-card p-4 flex flex-col gap-1 text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
              Recetas listas
            </span>
            <span className="text-2xl font-bold text-[#1a1b21] tabular-nums">
              {liveArgs.readyRecipesCount || 0} de {liveArgs.totalRecipesCount || 18}
            </span>
            <span className="text-[11px] text-[#555869]">Disponibles para preparar</span>
          </button>
        </div>
      </div>

      {/* 5. PANEL "PRIMEROS PASOS" (Visible solo mientras falte completar algún paso clave) */}
      {!allStepsCompleted && (
        <div className="w-full max-w-7xl px-4">
          <div className="living-card p-6 flex flex-col gap-4 border border-[oklch(48%_0.16_45)]/20 bg-gradient-to-r from-[oklch(92%_0.06_55)]/15 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[oklch(48%_0.16_45)]" />
                <h3 className="text-base font-bold text-[#1a1b21] m-0">Primeros Pasos del Negocio</h3>
              </div>
              <span className="text-xs text-[#555869] font-medium">Guía de puesta a punto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Paso 1: Ingredientes */}
              <button
                onClick={() => onQuickAction('ingredientes')}
                className="p-3 rounded-2xl bg-white border border-black/8 text-left flex items-start gap-2.5 hover:shadow-xs transition-shadow"
              >
                {stepIngredientsDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[oklch(48%_0.16_45)] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#555869] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1a1b21] block leading-tight">1. Ingredientes</span>
                  <span className="text-[11px] text-[#555869]">Almacén y compras</span>
                </div>
              </button>

              {/* Paso 2: Recetas */}
              <button
                onClick={() => onQuickAction('cocina')}
                className="p-3 rounded-2xl bg-white border border-black/8 text-left flex items-start gap-2.5 hover:shadow-xs transition-shadow"
              >
                {stepRecipesDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[oklch(48%_0.16_45)] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#555869] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1a1b21] block leading-tight">2. Crear recetas</span>
                  <span className="text-[11px] text-[#555869]">Escandallos y costo</span>
                </div>
              </button>

              {/* Paso 3: Catálogo */}
              <button
                onClick={() => onQuickAction('catalogo')}
                className="p-3 rounded-2xl bg-white border border-black/8 text-left flex items-start gap-2.5 hover:shadow-xs transition-shadow"
              >
                {stepProductsDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[oklch(48%_0.16_45)] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#555869] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1a1b21] block leading-tight">3. Publicar con foto</span>
                  <span className="text-[11px] text-[#555869]">Catálogo de venta</span>
                </div>
              </button>

              {/* Paso 4: Primera Venta */}
              <button
                onClick={() => onQuickAction('ventas')}
                className="p-3 rounded-2xl bg-white border border-black/8 text-left flex items-start gap-2.5 hover:shadow-xs transition-shadow"
              >
                {stepFirstSaleDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[oklch(48%_0.16_45)] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#555869] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-bold text-[#1a1b21] block leading-tight">4. Primera venta</span>
                  <span className="text-[11px] text-[#555869]">Cobro en caja POS</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SECUENCIA REAL DEL NEGOCIO (4 ETAPAS NUMERADAS) */}
      <div className="w-full max-w-7xl px-4 flex flex-col gap-10">
        {BUSINESS_STAGES.map((stage) => {
          const modulesInStage = MODULES_CONFIG.filter((m) => stage.moduleIds.includes(m.id))
          const health = stage.getHealthBadge(liveArgs)

          return (
            <div key={stage.key} className="flex flex-col gap-4">
              {/* Encabezado ÚNICO de la Etapa con Indicador de Salud */}
              <div className="flex items-center justify-between pb-2 border-b border-black/8">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1a1b21] text-white text-xs font-bold flex items-center justify-center">
                    {stage.stepNumber}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                    {stage.title}
                  </h2>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    health.isAlert
                      ? 'bg-[#fee2e2] text-[#b91c1c]'
                      : 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]'
                  }`}
                >
                  {health.text}
                </span>
              </div>

              {/* Cuadrícula de módulos en esta etapa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {modulesInStage.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    liveArgs={liveArgs}
                    onClick={() => onSelectModule(mod)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Fila Discreta de Configuración */}
        {configModule && (
          <div className="pt-6 border-t border-black/8 flex items-center justify-between p-4 rounded-2xl bg-white border border-black/6">
            <div className="flex items-center gap-3">
              <div className="moss-icon-circle !w-8 !h-8">
                <configModule.icon className="w-4 h-4 text-[oklch(48%_0.16_45)]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1a1b21] block">Ajustes y Configuración</span>
                <span className="text-[11px] text-[#555869]">Sedes, usuarios, estado de base de datos y parámetros</span>
              </div>
            </div>

            <Button
              variant="drop"
              onClick={() => onSelectModule(configModule)}
              className="!text-xs !min-h-[40px]"
            >
              Configurar →
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
