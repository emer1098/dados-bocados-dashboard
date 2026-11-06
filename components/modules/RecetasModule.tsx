import { InputField } from '@/components/living/InputField'
import { copy } from '@/lib/copy'
import React, { useState } from 'react'
import {
  ChefHat,
  Search,
  AlertTriangle,
  ArrowRight,
  Info,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'
import { RECIPES_DATA, checkRecipeFeasibility, ProductRecipe } from '@/lib/businessData'
import { IngredienteItem, formatPluralUnit } from './IngredientesModule'

export interface RecetasModuleProps {
  ingredients: IngredienteItem[]
  onNavigateToIngredients: () => void
}

const CF_UNITARIO = 1.80

export function RecetasModule({ ingredients, onNavigateToIngredients }: RecetasModuleProps) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('Todas')
  const [filterFeasibility, setFilterFeasibility] = useState<'Todas' | 'Listas' | 'Faltantes'>('Todas')
  const [selectedRecipe, setSelectedRecipe] = useState<ProductRecipe | null>(null)
  const recipeModalRef = useOverlayBehavior<HTMLDivElement>(Boolean(selectedRecipe), () => setSelectedRecipe(null))

  const categories = ['Todas', ...Array.from(new Set(RECIPES_DATA.map((r) => r.category)))]

  // Filtrado
  const filteredRecipes = RECIPES_DATA.filter((recipe) => {
    const feasibility = checkRecipeFeasibility(recipe, ingredients as any)
    const matchesSearch = recipe.productName.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'Todas' || recipe.category === filterCategory
    const matchesFeasibility =
      filterFeasibility === 'Todas' ||
      (filterFeasibility === 'Listas' && feasibility.canPrepare) ||
      (filterFeasibility === 'Faltantes' && !feasibility.canPrepare)

    return matchesSearch && matchesCategory && matchesFeasibility
  })

  const readyCount = RECIPES_DATA.filter((r) => checkRecipeFeasibility(r, ingredients as any).canPrepare).length

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. PageHeader Alineado a la Izquierda */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">INVENTARIO · PRODUCCIÓN</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">
            Recetas y Cocina
          </h1>
          <p className="text-sm text-[#555869] mt-0.5">
            Escandallos, disponibilidad según stock actual y desglose de costos por porción.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToIngredients}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors"
        >
          <span>Ir a ingredientes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Indicadores Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Recetas disponibles
          </span>
          <span className="text-2xl font-bold text-[oklch(48%_0.16_45)] numeral-clean">
            {readyCount} de {RECIPES_DATA.length}
          </span>
          <span className="text-[11px] text-[#555869]">Listas para preparar con el stock actual</span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Incompletas por ingredientes
          </span>
          <span className="text-2xl font-bold text-[#b91c1c] numeral-clean">
            {RECIPES_DATA.length - readyCount}
          </span>
          <span className="text-[11px] text-[#555869]">Requieren reposición en almacén</span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Costo Fijo Asignado (CF)
          </span>
          <span className="text-2xl font-bold text-[#1a1b21] numeral-clean">
            S/ {CF_UNITARIO.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#555869]">Absorción fija por unidad/porción</span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Disponibilidad */}
          <div className="flex bg-black/5 p-1 rounded-full border border-black/8">
            {(['Todas', 'Listas', 'Faltantes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterFeasibility(mode)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterFeasibility === mode
                    ? 'bg-[#1a1b21] text-white shadow-xs'
                    : 'text-[#555869] hover:text-[#1a1b21]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="living-select text-xs !py-1.5 !px-3 !min-h-[40px] w-auto"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'Todas' ? 'Todas las categorías' : c}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-64">
          <InputField
            leftIcon={<Search className="w-4 h-4" />}
            placeholder={copy.placeholders.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!h-10 !min-h-[40px] text-xs"
          />
        </div>
      </div>

      {/* 4. Cuadrícula de Recetas con Enlace de Reposición Directo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => {
          const feasibility = checkRecipeFeasibility(recipe, ingredients as any)
          const cv = recipe.costDirecto
          const cf = CF_UNITARIO
          const ctu = cv + cf
          const ganancia = recipe.precioVenta - ctu
          const margenPct = recipe.precioVenta > 0 ? (ganancia / recipe.precioVenta) * 100 : 0

          return (
            <div
              key={recipe.productName}
              onClick={() => setSelectedRecipe(recipe)}
              className="living-card p-5 flex flex-col justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow group text-left"
            >
              <div className="flex flex-col gap-2.5">
                {/* Categoría y Badge de Disponibilidad */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#555869] uppercase tracking-wider">
                    {recipe.category}
                  </span>

                  {feasibility.canPrepare ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]">
                      ✓ Listo · {feasibility.maxPortionsPossible} porc.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fee2e2] text-[#b91c1c]">
                      ✗ Falta {feasibility.missingIngredients.length} ingrediente{feasibility.missingIngredients.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold font-cormorant text-[#1a1b21] m-0 group-hover:text-[oklch(48%_0.16_45)] transition-colors leading-tight">
                  {recipe.productName}
                </h3>
                <p className="text-xs text-[#555869] m-0 line-clamp-1">
                  {recipe.yieldDescription}
                </p>

                {/* ENLACE DIRECTO DE REPOSICIÓN SI FALTA INGREDIENTE */}
                {!feasibility.canPrepare && feasibility.missingIngredients.length > 0 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigateToIngredients()
                    }}
                    className="p-2 rounded-xl bg-[#fee2e2]/60 border border-[#fca5a5] flex items-center justify-between text-[11px] text-[#b91c1c] hover:bg-[#fee2e2] transition-colors"
                  >
                    <span className="font-semibold truncate">
                      Falta: {feasibility.missingIngredients[0].name}
                    </span>
                    <span className="font-bold underline shrink-0 ml-1">Reponer →</span>
                  </div>
                )}
              </div>

              {/* Desglose de Costo y Margen */}
              <div className="pt-3 border-t border-black/6 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#555869]">CV (Insumos):</span>
                  <span className="font-semibold text-[#1a1b21] numeral-clean">S/ {cv.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#555869]">CF asignado:</span>
                  <span className="font-semibold text-[#1a1b21] numeral-clean">S/ {cf.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between font-bold pt-1 border-t border-black/4">
                  <span className="text-[#1a1b21]">Precio Venta:</span>
                  <span className="text-sm font-extrabold text-[oklch(48%_0.16_45)] numeral-clean">
                    S/ {recipe.precioVenta.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Ficha Técnica con Desglose */}
      {selectedRecipe && (
        <OverlayPortal>
          <div ref={recipeModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-lg w-full !p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto living-zoom-in">
            <div className="flex items-start justify-between pb-2 border-b border-black/8">
              <div>
                <span className="eyebrow">{selectedRecipe.category}</span>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  {selectedRecipe.productName}
                </h2>
                <p className="text-xs text-[#555869] mt-0.5">{selectedRecipe.yieldDescription}</p>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Ingredientes de la Receta */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1b21]">
                Ingredientes requeridos
              </h3>
              <div className="flex flex-col gap-1.5">
                {selectedRecipe.ingredients.map((ing) => (
                  <div
                    key={ing.ingredient}
                    className="p-2.5 rounded-xl bg-black/[0.02] border border-black/6 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#1a1b21]">{ing.ingredient}</span>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[#555869] numeral-clean">{ing.quantity}</span>
                      <span className="font-bold text-[#1a1b21] numeral-clean">S/ {ing.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose de Costos CTU */}
            <div className="p-3.5 rounded-2xl bg-black/[0.03] flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#555869]">Costo Variable (CV):</span>
                <span className="font-bold numeral-clean">S/ {selectedRecipe.costDirecto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555869]">Costo Fijo Asignado (CF):</span>
                <span className="font-bold numeral-clean">S/ {CF_UNITARIO.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-black/6 font-bold">
                <span>Costo Total Unitario (CTU):</span>
                <span className="numeral-clean">S/ {(selectedRecipe.costDirecto + CF_UNITARIO).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-[oklch(48%_0.16_45)]">
                <span>Ganancia Neta por Venta:</span>
                <span className="numeral-clean">
                  S/ {(selectedRecipe.precioVenta - (selectedRecipe.costDirecto + CF_UNITARIO)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/8">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecipe(null)
                  onNavigateToIngredients()
                }}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21]"
              >
                Ver en ingredientes
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90"
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}
    </div>
  )
}
