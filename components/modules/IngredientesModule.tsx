import { InputField } from '@/components/living/InputField'
import { copy } from '@/lib/copy'
import React, { useState } from 'react'
import {
  UtensilsCrossed,
  Plus,
  Search,
  MoreVertical,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  X,
  Layers,
  ChefHat,
  Filter,
  Check,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react'
import { RECIPES_DATA } from '@/lib/businessData'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'

// Función única y estandarizada para pluralizar unidades en español
export function formatPluralUnit(amount: number, unitRaw: string): string {
  const cleanUnit = unitRaw.split('(')[0].trim().toLowerCase()
  if (amount === 1) return cleanUnit
  if (cleanUnit.endsWith('z')) return cleanUnit.slice(0, -1) + 'ces'
  if (cleanUnit.endsWith('r') || cleanUnit.endsWith('l') || cleanUnit.endsWith('n')) {
    return cleanUnit + 'es'
  }
  if (cleanUnit.endsWith('s') || cleanUnit === 'kg' || cleanUnit === 'g' || cleanUnit === 'ml' || cleanUnit === 'oz') {
    return cleanUnit
  }
  return cleanUnit + 's'
}

export interface IngredienteItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  unitCost: number
}

export interface IngredientesModuleProps {
  ingredients: IngredienteItem[]
  onAdjustStock: (id: string, delta: number, reason: string) => Promise<void>
  onUpdateIngredient: (id: string, data: Partial<IngredienteItem>) => Promise<void>
  onDeleteIngredient: (id: string) => Promise<void>
  onCreateIngredient: (data: any) => Promise<void>
  onNavigateToRecipes?: () => void
}

export function IngredientesModule({
  ingredients,
  onAdjustStock,
  onUpdateIngredient,
  onDeleteIngredient,
  onCreateIngredient,
  onNavigateToRecipes,
}: IngredientesModuleProps) {
  // Subnavegación en Pestañas: Existencias · Alertas · Recetas que lo usan
  const [activeTab, setActiveTab] = useState<'existencias' | 'alertas' | 'recetas'>('existencias')

  // Filtros y búsqueda
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('Todas')
  const [filterStockStatus, setFilterStockStatus] = useState<'Todos' | 'Bajo' | 'Agotado'>('Todos')

  // Selección Múltiple
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Drawer Lateral de Detalle
  const [drawerIngredient, setDrawerIngredient] = useState<IngredienteItem | null>(null)

  // Modales
  const [modalMode, setModalMode] = useState<'adjust' | 'edit' | 'create' | null>(null)
  const [activeIng, setActiveIng] = useState<IngredienteItem | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const drawerRef = useOverlayBehavior<HTMLDivElement>(drawerIngredient !== null, () => setDrawerIngredient(null))
  const adjustModalRef = useOverlayBehavior<HTMLDivElement>(modalMode === 'adjust', () => setModalMode(null))
  const editModalRef = useOverlayBehavior<HTMLDivElement>(modalMode === 'edit' || modalMode === 'create', () => setModalMode(null))
  const rowMenuRef = useOverlayBehavior<HTMLDivElement>(menuOpenId !== null, () => setMenuOpenId(null), { lockScroll: false })

  // Formulario Ajuste con Motivo Obligatorio (Compra, Merma, Corrección, Uso interno)
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in')
  const [adjustAmount, setAdjustAmount] = useState<number>(1)
  const [adjustReason, setAdjustReason] = useState<string>('Compra de reposición')

  // Formulario Editar / Crear
  const [formData, setFormData] = useState({
    name: '',
    category: 'Insumo de Cocina',
    currentStock: 0,
    minStock: 2,
    unit: 'kg',
    unitCost: 0,
  })

  // Categorías Únicas
  const categories = ['Todas', ...Array.from(new Set(ingredients.map((i) => i.category || 'General')))]

  // Filtrado
  const filtered = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = filterCategory === 'Todas' || ing.category === filterCategory
    const isOut = ing.currentStock <= 0
    const isLow = ing.currentStock <= ing.minStock && !isOut
    const matchesStock =
      filterStockStatus === 'Todos' ||
      (filterStockStatus === 'Bajo' && isLow) ||
      (filterStockStatus === 'Agotado' && isOut)

    if (activeTab === 'alertas') {
      return matchesSearch && (isLow || isOut)
    }
    return matchesSearch && matchesCategory && matchesStock
  })

  // Obtener recetas que usan un ingrediente específico
  const getRecipesUsingIngredient = (ingredientName: string) => {
    return RECIPES_DATA.filter((recipe) =>
      recipe.ingredients.some((ing) =>
        ing.ingredient.toLowerCase().includes(ingredientName.toLowerCase()) ||
        ingredientName.toLowerCase().includes(ing.ingredient.toLowerCase())
      )
    )
  }

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((i) => i.id))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleOpenAdjust = (ing: IngredienteItem) => {
    setActiveIng(ing)
    setAdjustAmount(1)
    setAdjustType('in')
    setAdjustReason('Compra de reposición')
    setModalMode('adjust')
    setMenuOpenId(null)
  }

  const handleConfirmAdjust = async () => {
    if (!activeIng || adjustAmount <= 0) return
    const delta = adjustType === 'in' ? adjustAmount : -adjustAmount
    const fullReason = `${adjustReason} (${adjustType === 'in' ? 'Entrada' : 'Salida'})`
    await onAdjustStock(activeIng.id, delta, fullReason)
    setModalMode(null)
  }

  const handleOpenEdit = (ing: IngredienteItem) => {
    setActiveIng(ing)
    setFormData({
      name: ing.name,
      category: ing.category,
      currentStock: ing.currentStock,
      minStock: ing.minStock,
      unit: ing.unit,
      unitCost: ing.unitCost,
    })
    setModalMode('edit')
    setMenuOpenId(null)
  }

  const handleConfirmEdit = async () => {
    if (!activeIng) return
    await onUpdateIngredient(activeIng.id, formData)
    setModalMode(null)
  }

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Insumo de Cocina',
      currentStock: 5,
      minStock: 2,
      unit: 'kg',
      unitCost: 10,
    })
    setModalMode('create')
  }

  const handleConfirmCreate = async () => {
    if (!formData.name) return
    await onCreateIngredient(formData)
    setModalMode(null)
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. PageHeader Alineado a la Izquierda con 1 Solo Botón Primario */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="eyebrow">INVENTARIO</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1">
            Ingredientes y Materias Primas
          </h1>
          <p className="text-sm text-[#555869] mt-0.5">
            Control de existencias, punto de reposición y costeo de insumos de cocina.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (ingredients.length > 0) {
                handleOpenAdjust(ingredients[0])
              } else {
                handleOpenCreate()
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)] hover:bg-[oklch(92%_0.06_55)]/70 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Registrar Compra</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo ingrediente</span>
          </button>
        </div>
      </div>

      {/* 2. Subnavegación en Pestañas */}
      <div className="flex bg-black/5 p-1 rounded-full border border-black/8 w-fit gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('existencias')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'existencias'
              ? 'bg-[#1a1b21] text-white shadow-xs'
              : 'text-[#555869] hover:text-[#1a1b21]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Existencias ({ingredients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'alertas'
              ? 'bg-[#1a1b21] text-white shadow-xs'
              : 'text-[#555869] hover:text-[#1a1b21]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#b45309]" />
          <span>Alertas de reposición ({ingredients.filter((i) => i.currentStock <= i.minStock).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recetas')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === 'recetas'
              ? 'bg-[#1a1b21] text-white shadow-xs'
              : 'text-[#555869] hover:text-[#1a1b21]'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5 text-[oklch(48%_0.16_45)]" />
          <span>Recetas que lo usan</span>
        </button>
      </div>

      {/* 3. Barra de Herramientas Estándar (Búsqueda, Filtros y Selección Múltiple) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Búsqueda */}
          <div className="w-full sm:w-64">
            <InputField
              leftIcon={<Search className="w-4 h-4" />}
              placeholder={copy.placeholders.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!h-10 !min-h-[40px] text-xs"
            />
          </div>

          {/* Filtro Categoría */}
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

          {/* Filtro Estado Stock */}
          <div className="flex bg-black/5 p-1 rounded-full border border-black/8">
            {(['Todos', 'Bajo', 'Agotado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStockStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterStockStatus === st
                    ? 'bg-[#1a1b21] text-white shadow-xs'
                    : 'text-[#555869] hover:text-[#1a1b21]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Acciones de Selección Múltiple */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/10">
            <span className="text-xs font-bold text-[#1a1b21] numeral-clean">
              {selectedIds.length} seleccionados
            </span>
            <button
              onClick={() => alert(`Ajuste masivo propuesto para ${selectedIds.length} ingredientes.`)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1a1b21] text-white hover:opacity-90"
            >
              Ajustar lote
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[#555869] hover:text-[#1a1b21] text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Contenido Principal */}
      {filtered.length === 0 ? (
        <div className="living-card p-12 flex flex-col items-center justify-center text-center gap-3">
          <UtensilsCrossed className="w-10 h-10 text-[#555869]/50" />
          <h3 className="text-base font-bold text-[#1a1b21] m-0">Aún no hay ingredientes registrados</h3>
          <p className="text-xs text-[#555869] max-w-sm">
            Comienza agregando los ingredientes de cocina o importa tu inventario inicial.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90"
            >
              Agregar el primero
            </button>
          </div>
        </div>
      ) : (
        <div className="living-card overflow-hidden">
          <table className="living-table w-full">
            <thead>
              <tr>
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded border-black/20 text-[#1a1b21] focus:ring-[oklch(48%_0.16_45)]"
                  />
                </th>
                <th>Ingrediente</th>
                <th>Categoría</th>
                <th>Nivel de Stock</th>
                <th className="text-right">Costo Unitario</th>
                <th>Estado</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => {
                const isSelected = selectedIds.includes(ing.id)
                const isOut = ing.currentStock <= 0
                const isLow = ing.currentStock <= ing.minStock && !isOut
                const pct = Math.min(100, Math.round((ing.currentStock / (ing.minStock * 2.5 || 10)) * 100))

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
                    <td>
                      <button
                        onClick={() => setDrawerIngredient(ing)}
                        className="font-bold text-[#1a1b21] hover:underline text-left block"
                      >
                        {ing.name}
                      </button>
                      <span className="text-[11px] text-[#555869] numeral-clean">
                        Mínimo: {ing.minStock} {formatPluralUnit(ing.minStock, ing.unit)}
                      </span>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/5 text-[#555869]">
                        {ing.category}
                      </span>
                    </td>
                    <td className="min-w-[140px]">
                      <div className="flex items-center justify-between text-xs font-bold mb-1 numeral-clean">
                        <span>{ing.currentStock} {formatPluralUnit(ing.currentStock, ing.unit)}</span>
                        <span className="text-[#555869] text-[10px]">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/8 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isOut ? '#b91c1c' : isLow ? '#b45309' : 'oklch(48% 0.16 45)',
                          }}
                        />
                      </div>
                    </td>
                    <td className="text-right font-bold text-[#1a1b21] numeral-clean">
                      S/ {ing.unitCost.toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isOut
                            ? 'bg-[#fee2e2] text-[#b91c1c]'
                            : isLow
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : 'bg-[oklch(92%_0.06_55)]/40 text-[oklch(48%_0.16_45)]'
                        }`}
                      >
                        {isOut ? '● Agotado' : isLow ? '▲ Stock bajo' : '✓ OK'}
                      </span>
                    </td>
                    <td className="text-right">
                      {/* UNA acción por fila: Menú ⋯ */}
                      <div ref={menuOpenId === ing.id ? rowMenuRef : undefined} className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setMenuOpenId(menuOpenId === ing.id ? null : ing.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-[#555869] focus-visible:ring-2 focus-visible:ring-[oklch(48%_0.16_45)]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenId === ing.id && (
                          <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white border border-black/10 shadow-xl p-1.5 z-40 text-left living-zoom-in">
                            <button
                              onClick={() => handleOpenAdjust(ing)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-black/5 text-[#1a1b21]"
                            >
                              <Plus className="w-3.5 h-3.5 text-[oklch(48%_0.16_45)]" />
                              <span>Registrar compra / ajuste</span>
                            </button>
                            <button
                              onClick={() => {
                                setDrawerIngredient(ing)
                                setMenuOpenId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-black/5 text-[#1a1b21]"
                            >
                              <ChefHat className="w-3.5 h-3.5 text-[#555869]" />
                              <span>Ver recetas ({getRecipesUsingIngredient(ing.name).length})</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ing)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-black/5 text-[#1a1b21]"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#555869]" />
                              <span>Editar datos</span>
                            </button>
                            <div className="h-px bg-black/6 my-1" />
                            <button
                              onClick={() => {
                                onDeleteIngredient(ing.id)
                                setMenuOpenId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-[#fee2e2] text-[#b91c1c]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. DRAWER LATERAL: Ficha de Ingrediente con Recetas que lo Usan */}
      {drawerIngredient && (
        <OverlayPortal>
          <div ref={drawerRef} className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in">
            <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto living-slide-right">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between pb-3 border-b border-black/8">
                <div>
                  <span className="eyebrow">FICHA TÉCNICA</span>
                  <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] mt-0.5">
                    {drawerIngredient.name}
                  </h2>
                  <span className="text-xs text-[#555869]">{drawerIngredient.category}</span>
                </div>
                <button
                  onClick={() => setDrawerIngredient(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Métricas del Ingrediente */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-black/[0.03]">
                  <span className="text-[11px] text-[#555869] font-medium block">Existencias actuales</span>
                  <span className="text-xl font-bold text-[#1a1b21] numeral-clean">
                    {drawerIngredient.currentStock} {formatPluralUnit(drawerIngredient.currentStock, drawerIngredient.unit)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.03]">
                  <span className="text-[11px] text-[#555869] font-medium block">Punto de reposición</span>
                  <span className="text-xl font-bold text-[#b45309] numeral-clean">
                    {drawerIngredient.minStock} {formatPluralUnit(drawerIngredient.minStock, drawerIngredient.unit)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.03]">
                  <span className="text-[11px] text-[#555869] font-medium block">Costo unitario</span>
                  <span className="text-xl font-bold text-[#1a1b21] numeral-clean">
                    S/ {drawerIngredient.unitCost.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/[0.03]">
                  <span className="text-[11px] text-[#555869] font-medium block">Valor inventario</span>
                  <span className="text-xl font-bold text-[#1a1b21] numeral-clean">
                    S/ {(drawerIngredient.currentStock * drawerIngredient.unitCost).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Recetas asociadas */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#1a1b21] m-0">
                    Se usa en {getRecipesUsingIngredient(drawerIngredient.name).length} recetas
                  </h3>
                  {onNavigateToRecipes && (
                    <button
                      onClick={onNavigateToRecipes}
                      className="text-xs font-semibold text-[oklch(48%_0.16_45)] hover:underline"
                    >
                      Ver en Cocina →
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {getRecipesUsingIngredient(drawerIngredient.name).map((rec) => (
                    <div
                      key={rec.productName}
                      className="p-3 rounded-2xl bg-black/[0.02] border border-black/6 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1a1b21] block">{rec.productName}</span>
                        <span className="text-[#555869] text-[11px]">{rec.category}</span>
                      </div>
                      <span className="font-bold text-[#1a1b21] numeral-clean">
                        S/ {rec.precioVenta.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/8 flex items-center gap-2">
              <button
                onClick={() => {
                  handleOpenAdjust(drawerIngredient)
                  setDrawerIngredient(null)
                }}
                className="w-full py-2.5 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity"
              >
                Ajustar existencias
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}

      {/* 6. MODAL AJUSTAR STOCK CON MOTIVO OBLIGATORIO */}
      {modalMode === 'adjust' && activeIng && (
        <OverlayPortal>
          <div ref={adjustModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-5 living-zoom-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  {adjustType === 'in' ? 'Registrar Compra / Entrada' : 'Registrar Salida / Merma'}
                </h2>
                <p className="text-xs text-[#555869] mt-0.5">
                  {activeIng.name} · Stock actual: {activeIng.currentStock} {formatPluralUnit(activeIng.currentStock, activeIng.unit)}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector Entrada / Salida */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('in')}
                className={`py-2 rounded-2xl text-xs font-bold border transition-all ${
                  adjustType === 'in'
                    ? 'bg-[oklch(92%_0.06_55)]/40 border-[oklch(48%_0.16_45)] text-[oklch(48%_0.16_45)]'
                    : 'bg-white border-black/10 text-[#555869]'
                }`}
              >
                + Entrada (Recepción)
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('out')}
                className={`py-2 rounded-2xl text-xs font-bold border transition-all ${
                  adjustType === 'out'
                    ? 'bg-[#fee2e2] border-[#b91c1c] text-[#b91c1c]'
                    : 'bg-white border-black/10 text-[#555869]'
                }`}
              >
                - Salida (Consumo / Merma)
              </button>
            </div>

            <InputField
              label={`Cantidad a ${adjustType === 'in' ? 'ingresar' : 'retirar'}`}
              type="number"
              min="0.1"
              step="any"
              suffixText={activeIng ? activeIng.unit : undefined}
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="text-lg font-bold numeral-clean"
            />

            {/* Motivo OBLIGATORIO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1b21]">
                Motivo del ajuste *
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="living-select text-xs font-semibold"
              >
                <option value="Compra de reposición">Compra de reposición</option>
                <option value="Merma o vencimiento">Merma o vencimiento</option>
                <option value="Corrección de conteo físico">Corrección de conteo físico</option>
                <option value="Uso interno o degustación">Uso interno o degustación</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/6">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90"
              >
                Confirmar ajuste
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}

      {/* 7. MODAL EDITAR / CREAR */}
      {(modalMode === 'edit' || modalMode === 'create') && (
        <OverlayPortal>
          <div ref={editModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 ">
            <div className="glass-card !bg-white max-w-md w-full !p-6 flex flex-col gap-4 living-zoom-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                  {modalMode === 'edit' ? 'Editar ingrediente' : 'Nuevo ingrediente'}
                </h2>
                <p className="text-xs text-[#555869] mt-0.5">
                  Parámetros de almacén y costeo
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <InputField
                label="Nombre *"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Harina preparada"
              />

              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Categoría"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <InputField
                  label="Unidad"
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, ml, uds."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <InputField
                  label="Stock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                  className="numeral-clean font-bold"
                />
                <InputField
                  label="Mínimo"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                  className="numeral-clean"
                />
                <InputField
                  label="Costo (S/)"
                  type="number"
                  step="0.01"
                  prefixText="S/"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                  className="numeral-clean font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/6">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={modalMode === 'edit' ? handleConfirmEdit : handleConfirmCreate}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90"
              >
                {modalMode === 'edit' ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
        </OverlayPortal>
      )}
    </div>
  )
}
