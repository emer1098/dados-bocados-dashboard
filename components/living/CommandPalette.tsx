'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  X,
  Plus,
  ArrowRight,
  ShoppingBag,
  Gamepad2,
  UtensilsCrossed,
  CornerDownLeft,
} from 'lucide-react'
import { MODULES_CONFIG, ModuleConfig } from '@/lib/modules.config'
import { RECIPES_DATA } from '@/lib/businessData'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { InputField } from './InputField'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigateModule: (moduleId: string, path: string) => void
  onTriggerAction: (actionKey: string) => void
  products: any[]
}

interface PaletteItem {
  id: string
  label: string
  detail?: string
  run: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigateModule,
  onTriggerAction,
  products,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const overlayRef = useOverlayBehavior<HTMLDivElement>(isOpen, onClose, {
    escape: false,
    outsideClick: false,
    lockScroll: true,
  })
  const listRef = useRef<HTMLDivElement>(null)

  const quickActions = useMemo(
    () => [
      { id: 'new_sale', label: 'Nueva venta en caja POS', icon: Plus, targetModule: 'ventas', path: '/ventas' },
      { id: 'view_tables', label: 'Ver estado de mesas y ludoteca', icon: Gamepad2, targetModule: 'mesas', path: '/mesas' },
      { id: 'manage_ingredients', label: 'Revisar almacén de ingredientes', icon: UtensilsCrossed, targetModule: 'ingredientes', path: '/ingredientes' },
    ],
    [Plus, Gamepad2, UtensilsCrossed]
  )

  const q = search.trim().toLowerCase()

  const items: PaletteItem[] = useMemo(() => {
    if (!isOpen) return []

    const actions = quickActions
      .filter((a) => a.label.toLowerCase().includes(q))
      .map((a) => ({
        id: `action:${a.id}`,
        label: a.label,
        run: () => {
          onNavigateModule(a.targetModule, a.path)
          onClose()
        },
      }))

    const modules = MODULES_CONFIG.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.shortDescription.toLowerCase().includes(q)
    ).map((mod) => ({
      id: `module:${mod.id}`,
      label: mod.name,
      detail: mod.shortDescription,
      run: () => {
        onNavigateModule(mod.id, mod.path)
        onClose()
      },
    }))

    const prods = products
      .filter((p) => (p.name || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map((p: any) => ({
        id: `product:${p.id}`,
        label: p.name,
        detail: `S/ ${(Number(p.price) || 0).toFixed(2)}`,
        run: () => {
          onNavigateModule('catalogo', '/catalogo')
          onClose()
        },
      }))

    const recipes = RECIPES_DATA.filter((r) => r.productName.toLowerCase().includes(q))
      .slice(0, 4)
      .map((r) => ({
        id: `recipe:${r.productName}`,
        label: r.productName,
        detail: `PV S/ ${r.precioVenta.toFixed(2)}`,
        run: () => {
          onNavigateModule('cocina', '/cocina')
          onClose()
        },
      }))

    return [...actions, ...modules, ...prods, ...recipes]
  }, [isOpen, q, quickActions, products, onNavigateModule, onClose])

  useEffect(() => {
    setActiveIndex(0)
  }, [search, isOpen])

  useEffect(() => {
    if (!isOpen || items.length === 0) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-palette-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen, items.length])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (items.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + items.length) % items.length)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        items[Math.min(activeIndex, items.length - 1)]?.run()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, items, activeIndex])

  if (!isOpen) return null

  let cursor = 0
  const nextIndex = () => cursor++

  const renderItem = (item: PaletteItem, opts: { icon?: React.ReactNode; price?: string; right?: React.ReactNode; compact?: boolean }) => {
    const index = nextIndex()
    const isActive = index === Math.min(activeIndex, items.length - 1)
    return (
      <button
        key={item.id}
        data-palette-index={index}
        role="option"
        aria-selected={isActive}
        onMouseMove={() => setActiveIndex(index)}
        onClick={item.run}
        className={`w-full flex items-center justify-between ${opts.compact ? 'p-2' : 'p-2.5'} rounded-xl text-left text-sm transition-colors ${
          isActive ? 'bg-black/[0.07]' : 'hover:bg-black/5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {opts.icon}
          {opts.icon ? (
            <span className="truncate font-semibold text-[#1a1b21]">{item.label}</span>
          ) : (
            <div className="min-w-0">
              <span className="font-medium text-[#1a1b21] block truncate">{item.label}</span>
              {(item.detail || opts.price) && (
                <span className={`text-xs block ${opts.price ? 'font-bold text-[#1a1b21] tabular-nums' : 'text-[#555869] font-normal'}`}>
                  {opts.price ?? item.detail}
                </span>
              )}
            </div>
          )}
        </div>
        {opts.right ?? <ArrowRight className="w-4 h-4 text-[#555869] shrink-0" />}
      </button>
    )
  }

  const section = (label: string, children: React.ReactNode, first = false) =>
    children ? (
      <div className={`flex flex-col gap-1 ${first ? '' : 'border-t border-black/6 pt-2'}`}>
        <span className="text-[11px] font-bold text-[#555869] uppercase tracking-wider px-2">{label}</span>
        {children}
      </div>
    ) : null

  const actionItems = items.filter((i) => i.id.startsWith('action:'))
  const moduleItems = items.filter((i) => i.id.startsWith('module:'))
  const productItems = items.filter((i) => i.id.startsWith('product:'))
  const recipeItems = items.filter((i) => i.id.startsWith('recipe:'))

  return (
    <OverlayPortal>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/45 animate-fade-in"
      >
      <div
        className="w-full max-w-xl glass-card !bg-white !p-4 shadow-2xl flex flex-col gap-3 max-h-[80vh] overflow-hidden border border-black/10 living-zoom-in"
        role="listbox"
        aria-label="Palabra clave de comandos"
      >
        {/* Barra de entrada de comandos */}
        <div className="p-1 border-b border-black/8">
          <InputField
            leftIcon={<Search className="w-5 h-5" />}
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            rightAction={
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center text-[#555869] hover:text-[#1a1b21] transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            }
          />
        </div>

        {/* Lista de resultados scrolleable */}
        <div ref={listRef} id="command-palette-list" className="flex flex-col gap-4 overflow-y-auto px-1 py-1 max-h-[60vh]">
          {items.length === 0 && (
            <div className="py-8 text-center text-xs text-[#555869]">
              Sin resultados para “{search}”. Prueba con otro término.
            </div>
          )}

          {actionItems.length > 0 && section('Acciones Rápidas', actionItems.map((item) => {
            const act = quickActions.find((a) => `action:${a.id}` === item.id)
            const IconComp = act?.icon ?? Plus
            return renderItem(item, {
              icon: (
                <div className="w-7 h-7 rounded-lg bg-[oklch(92%_0.06_55)] text-[oklch(48%_0.16_45)] flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
              ),
            })
          }), true)}

          {moduleItems.length > 0 && section('Módulos', moduleItems.map((item) => {
            const mod = MODULES_CONFIG.find((m) => `module:${m.id}` === item.id)
            const IconComp = mod?.icon ?? ShoppingBag
            return renderItem(item, {
              icon: (
                <div className="w-7 h-7 rounded-lg bg-black/5 text-[#1a1b21] flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
              ),
            })
          }))}

          {productItems.length > 0 && section('Catálogo de Productos', productItems.map((item) =>
            renderItem(item, {
              compact: true,
              right: (
                <span className="font-bold text-[#1a1b21] tabular-nums text-sm shrink-0">
                  {item.detail}
                </span>
              ),
            })
          ))}

          {recipeItems.length > 0 && section('Recetas de Cocina', recipeItems.map((item) =>
            renderItem(item, {
              compact: true,
              right: (
                <span className="text-xs font-bold text-[oklch(48%_0.16_45)] shrink-0">
                  {item.detail}
                </span>
              ),
            })
          ))}
        </div>

        {/* Pie con atajos */}
        <div className="pt-2 border-t border-black/8 flex items-center justify-between text-[11px] text-[#555869]">
          <span>
            <strong className="font-semibold text-[#1a1b21]">↑ ↓</strong> mover ·{' '}
            <strong className="font-semibold text-[#1a1b21]">ESC</strong> cerrar
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#1a1b21]">
            Seleccionar <CornerDownLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
    </OverlayPortal>
  )
}
