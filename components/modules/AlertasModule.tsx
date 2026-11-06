import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Package,
  UtensilsCrossed,
  CheckCircle2,
  ArrowRight,
  ShoppingCart,
  Copy,
  Printer,
  Share2,
  Check,
  X,
} from 'lucide-react'
import { formatPluralUnit } from './IngredientesModule'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

export interface AlertasModuleProps {
  ingredients: any[]
  products: any[]
  onNavigateToIngredients: () => void
  onNavigateToCatalog: () => void
}

export function AlertasModule({
  ingredients,
  products,
  onNavigateToIngredients,
  onNavigateToCatalog,
}: AlertasModuleProps) {
  const lowIngredients = ingredients.filter((i) => i.currentStock <= i.minStock)
  const lowProducts = products.filter((p) => p.stock < 5)
  const totalAlerts = lowIngredients.length + lowProducts.length

  // Selección múltiple para lista de compra
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    lowIngredients.map((i) => i.id)
  )
  const [listModalOpen, setListModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const listModalRef = useOverlayBehavior<HTMLDivElement>(listModalOpen, () => setListModalOpen(false))

  const handleToggleSelectAll = () => {
    if (selectedIngredientIds.length === lowIngredients.length) {
      setSelectedIngredientIds([])
    } else {
      setSelectedIngredientIds(lowIngredients.map((i) => i.id))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // Generar lista de compra sugerida agrupada por categoría
  const selectedItems = lowIngredients.filter((i) => selectedIngredientIds.includes(i.id))
  
  // Cálculo de sugerencia: llevar hasta el nivel óptimo (mínimo * 2.5)
  const shoppingList = selectedItems.map((item) => {
    const idealStock = item.minStock * 2.5
    const suggestedBuy = Math.max(1, Math.ceil(idealStock - item.currentStock))
    const estimatedCost = suggestedBuy * item.unitCost
    return {
      ...item,
      suggestedBuy,
      estimatedCost,
    }
  })

  const totalEstimatedCost = shoppingList.reduce((acc, item) => acc + item.estimatedCost, 0)

  // Texto para copiar o compartir por WhatsApp
  const generatePlainTextList = () => {
    let text = `📋 LISTA DE COMPRA SUGERIDA · DADOS & BOCADOS\nFecha: ${new Date().toLocaleDateString('es-PE')}\n\n`
    shoppingList.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} (${item.category})\n`
      text += `   Comprar: ${item.suggestedBuy} ${formatPluralUnit(item.suggestedBuy, item.unit)} · Est: S/ ${item.estimatedCost.toFixed(2)}\n`
    })
    text += `\nTotal Estimado: S/ ${totalEstimatedCost.toFixed(2)}`
    return text
  }

  const copyTimerRef = React.useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainTextList())
    setCopied(true)
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      copyTimerRef.current = null
    }, 2000)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generatePlainTextList())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. PageHeader Alineado a la Izquierda */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">INVENTARIO · CONTROL DE RIESGOS</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">
            Alertas de Stock
            {totalAlerts > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fee2e2] text-[#b91c1c] numeral-clean">
                {totalAlerts}
              </span>
            )}
          </h1>
          <p className="text-sm text-[#555869] mt-0.5">
            Detección inmediata de materias primas agotadas y generación de listas de reposición.
          </p>
        </div>

        {lowIngredients.length > 0 && (
          <button
            type="button"
            onClick={() => setListModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Crear lista de compra ({selectedIngredientIds.length})</span>
          </button>
        )}
      </div>

      {totalAlerts === 0 ? (
        <div className="living-card p-14 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-[#1a1b21] text-base m-0">Todo el inventario está en niveles óptimos</p>
            <p className="text-xs text-[#555869] mt-1">
              No hay ingredientes ni productos por debajo del stock mínimo de seguridad.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Alertas de Ingredientes (Materias Primas) */}
          {lowIngredients.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#b91c1c]" />
                  <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0">
                    Ingredientes con Reposición Necesaria ({lowIngredients.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToIngredients}
                  className="text-xs font-bold text-[oklch(48%_0.16_45)] hover:underline flex items-center gap-1"
                >
                  Ir al inventario <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="living-card overflow-hidden">
                <table className="living-table w-full">
                  <thead>
                    <tr>
                      <th className="w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIngredientIds.length === lowIngredients.length}
                          onChange={handleToggleSelectAll}
                          className="rounded border-black/20 text-[#1a1b21] focus:ring-[oklch(48%_0.16_45)]"
                        />
                      </th>
                      <th>Ingrediente</th>
                      <th>Categoría</th>
                      <th className="text-right">Stock Actual</th>
                      <th className="text-right">Punto Reposición</th>
                      <th className="text-right">Compra Sugerida</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowIngredients.map((ing) => {
                      const isSelected = selectedIngredientIds.includes(ing.id)
                      const isOut = ing.currentStock <= 0
                      const idealStock = ing.minStock * 2.5
                      const suggested = Math.max(1, Math.ceil(idealStock - ing.currentStock))

                      return (
                        <tr key={ing.id} className={isSelected ? 'bg-black/[0.02]' : ''}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(ing.id)}
                              className="rounded border-black/20 text-[#1a1b21] focus:ring-[oklch(48%_0.16_45)]"
                            />
                          </td>
                          <td className="font-bold text-[#1a1b21]">{ing.name}</td>
                          <td>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 text-[#555869]">
                              {ing.category}
                            </span>
                          </td>
                          <td className="text-right font-extrabold text-[#b91c1c] numeral-clean">
                            {ing.currentStock} {formatPluralUnit(ing.currentStock, ing.unit)}
                          </td>
                          <td className="text-right text-xs text-[#555869] numeral-clean font-semibold">
                            {ing.minStock} {formatPluralUnit(ing.minStock, ing.unit)}
                          </td>
                          <td className="text-right font-bold text-[oklch(48%_0.16_45)] numeral-clean">
                            +{suggested} {formatPluralUnit(suggested, ing.unit)}
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={onNavigateToIngredients}
                              className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
                            >
                              Reponer
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alertas de Productos para Venta */}
          {lowProducts.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#b45309]" />
                  <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0">
                    Productos de Venta con Poco Stock ({lowProducts.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToCatalog}
                  className="text-xs font-bold text-[oklch(48%_0.16_45)] hover:underline flex items-center gap-1"
                >
                  Ir al catálogo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="living-card overflow-hidden">
                <table className="living-table w-full">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th className="text-right">Stock en Tienda</th>
                      <th className="text-right">Precio Venta</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-[#1a1b21]">{p.name}</td>
                        <td>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 text-[#555869]">
                            {p.category}
                          </span>
                        </td>
                        <td className="text-right font-extrabold text-[#b91c1c] numeral-clean">
                          {p.stock} uds.
                        </td>
                        <td className="text-right font-bold text-[#1a1b21] numeral-clean">
                          S/ {(Number(p.price) || 0).toFixed(2)}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={onNavigateToCatalog}
                            className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10 transition-colors"
                          >
                            Ajustar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL LISTA DE COMPRA SUGERIDA */}
      {listModalOpen && (
        <OverlayPortal>
          <div ref={listModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-lg w-full !p-6 flex flex-col gap-5 living-zoom-in">
            <div className="flex items-start justify-between pb-2 border-b border-black/8">
              <div>
                <span className="eyebrow">REPOSICIÓN DE ALMACÉN</span>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  Lista de Compra Sugerida
                </h2>
                <p className="text-xs text-[#555869] mt-0.5">
                  Cantidades calculadas para alcanzar el nivel óptimo de stock.
                </p>
              </div>
              <button
                onClick={() => setListModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de productos a comprar */}
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-black/[0.02] border border-black/6 flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1a1b21]">{item.name}</span>
                    <span className="text-[11px] text-[#555869]">{item.category}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="font-bold text-[oklch(48%_0.16_45)] numeral-clean">
                      Pedir: {item.suggestedBuy} {formatPluralUnit(item.suggestedBuy, item.unit)}
                    </span>
                    <span className="text-[10px] text-[#555869] numeral-clean">
                      Est. S/ {item.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total estimado */}
            <div className="p-3.5 rounded-2xl bg-[oklch(92%_0.06_55)]/25 border border-[oklch(48%_0.16_45)]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a1b21]">Presupuesto total estimado:</span>
              <span className="text-lg font-bold text-[oklch(48%_0.16_45)] numeral-clean">
                S/ {totalEstimatedCost.toFixed(2)}
              </span>
            </div>

            {/* Acciones: Copiar, Imprimir, Compartir por WhatsApp */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/8">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[oklch(48%_0.16_45)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-xs font-bold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}
    </div>
  )
}
