import React, { useState, useRef } from 'react'
import {
  Plus,
  Search,
  Download,
  Package,
  Edit2,
  Trash2,
  X,
  Camera,
  Upload,
  UtensilsCrossed,
  Layers,
  Sparkles,
} from 'lucide-react'
import { InputField } from '@/components/living/InputField'
import { useOverlayBehavior } from '@/components/hooks/useOverlayBehavior'
import { OverlayPortal } from '@/components/overlay/OverlayPortal'
import { copy } from '@/lib/copy'

export interface ProductItem {
  id: string
  name: string
  category: string
  subCategory?: string
  sku: string
  price: number
  cost?: number
  stock: number
  image?: string | null
  imageUrl?: string | null
}

export interface CatalogoModuleProps {
  products: any[]
  onCreateProduct: (prodData: any) => Promise<boolean>
  onUpdateProduct: (id: string, data: any) => Promise<boolean>
  onDeleteProduct: (id: string) => Promise<void>
  onRenameCategory?: (oldName: string, newName: string) => Promise<boolean>
  onDeleteCategory?: (name: string) => Promise<boolean>
  onExportCSV: () => void
}

export function CatalogoModule({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRenameCategory,
  onDeleteCategory,
  onExportCSV,
}: CatalogoModuleProps) {
  // Filtros principales
  const [mainFilter, setMainFilter] = useState<'Todos' | 'Alimentos y bebidas' | 'Juegos de mesa' | 'Sin foto' | 'Bajo stock'>('Todos')
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('Todas')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'precio_asc' | 'precio_desc' | 'stock'>('nombre')

  // Vista (Productos vs Categorías)
  const [view, setView] = useState<'productos' | 'categorias'>('productos')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [categoryDraft, setCategoryDraft] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)

  // Modales
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ProductItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Subida de imagen
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Formulario Crear / Editar
  const [form, setForm] = useState<{
    name: string
    category: string
    customCategory: string
    isNewCategory: boolean
    subCategory: string
    sku: string
    price: string
    cost: string
    stock: string
    imageUrl: string
  }>({
    name: '',
    category: 'Alimentos y bebidas',
    customCategory: '',
    isNewCategory: false,
    subCategory: 'WAFFLES Y POSTRES',
    sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    price: '',
    cost: '',
    stock: '15',
    imageUrl: '',
  })

  const productModalRef = useOverlayBehavior<HTMLDivElement>(modalOpen, () => setModalOpen(false), { outsideClick: false, escape: !uploadingImage })
  const deleteModalRef = useOverlayBehavior<HTMLDivElement>(confirmDelete !== null, () => setConfirmDelete(null))

  // Categorías y subcategorías dinámicas
  const subCategories = [
    'Todas',
    ...Array.from(new Set(products.map((p) => p.subCategory).filter(Boolean))),
  ] as string[]

  const availableCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[]

  // Filtrado y ordenamiento de productos
  const filtered = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(search.toLowerCase()))
      if (!matchesSearch) return false

      if (mainFilter === 'Sin foto') return !p.image && !p.imageUrl
      if (mainFilter === 'Bajo stock') return p.stock < 5
      if (mainFilter !== 'Todos' && p.category !== mainFilter) return false

      if (subCategoryFilter !== 'Todas' && p.subCategory !== subCategoryFilter) return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'precio_asc') return (Number(a.price) || 0) - (Number(b.price) || 0)
      if (sortBy === 'precio_desc') return (Number(b.price) || 0) - (Number(a.price) || 0)
      if (sortBy === 'stock') return (Number(a.stock) || 0) - (Number(b.stock) || 0)
      return (a.name || '').localeCompare(b.name || '')
    })

  // Métricas
  const totalItems = products.length
  const totalValue = products.reduce((acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0), 0)
  const missingPhotos = products.filter((p) => !p.image && !p.imageUrl).length

  // Subida de foto
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.url) {
        setImagePreview(data.url)
        setForm((prev) => ({ ...prev, imageUrl: data.url }))
      } else {
        setUploadError(data.error || 'Error al subir la imagen')
      }
    } catch {
      setUploadError('Error de conexión al subir la imagen')
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }

  const openNew = () => {
    setEditProduct(null)
    setImagePreview(null)
    setUploadError(null)
    setForm({
      name: '',
      category: 'Alimentos y bebidas',
      customCategory: '',
      isNewCategory: false,
      subCategory: 'WAFFLES Y POSTRES',
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      price: '',
      cost: '',
      stock: '15',
      imageUrl: '',
    })
    setModalOpen(true)
  }

  const openEdit = (p: ProductItem) => {
    setEditProduct(p)
    setImagePreview(p.imageUrl || p.image || null)
    setUploadError(null)
    setForm({
      name: p.name,
      category: p.category,
      customCategory: '',
      isNewCategory: false,
      subCategory: p.subCategory || '',
      sku: p.sku || '',
      price: String(p.price ?? ''),
      cost: p.cost ? String(p.cost) : '',
      stock: String(p.stock ?? '15'),
      imageUrl: p.imageUrl || p.image || '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const data = {
      name: form.name.trim(),
      category: form.isNewCategory ? (form.customCategory.trim() || 'Otros') : form.category,
      subCategory: form.subCategory.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price) || 0,
      cost: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      imageUrl: form.imageUrl || null,
    }

    if (editProduct) {
      await onUpdateProduct(editProduct.id, data)
    } else {
      await onCreateProduct(data)
    }
    setSubmitting(false)
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await onDeleteProduct(confirmDelete.id)
    setConfirmDelete(null)
  }

  const handleStartRenameCategory = (cat: string) => {
    setEditingCategory(cat)
    setCategoryDraft(cat)
  }

  const handleSaveRenameCategory = async (oldName: string) => {
    const trimmed = categoryDraft.trim()
    if (!trimmed || trimmed === oldName) {
      setEditingCategory(null)
      return
    }
    if (onRenameCategory) {
      setSavingCategory(true)
      await onRenameCategory(oldName, trimmed)
      setSavingCategory(false)
    }
    setEditingCategory(null)
  }

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* ── 1. CABECERA PRINCIPAL Y BOTONES DE ACCIÓN ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="eyebrow">CATÁLOGO Y PRECIOS</span>
          <h1 className="text-3xl font-bold font-cormorant text-[#1a1b21] mt-1 m-0">
            Productos <span className="text-[#555869] font-normal text-2xl numeral-clean">({totalItems})</span>
          </h1>
          <p className="text-sm text-[#555869] mt-0.5 m-0">
            Precios de venta en Soles, existencias y fotos de carta.
          </p>
        </div>

        {/* Barra de Acciones Superior Unificada con Altura de 40px */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Segmented Control para Vistas: Productos vs Categorías */}
          <div className="flex bg-black/5 p-1 rounded-full border border-black/8">
            <button
              type="button"
              onClick={() => setView('productos')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                view === 'productos' ? 'bg-[#1a1b21] text-white shadow-xs' : 'text-[#555869] hover:text-[#1a1b21]'
              }`}
            >
              Productos
            </button>
            <button
              type="button"
              onClick={() => setView('categorias')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                view === 'categorias' ? 'bg-[#1a1b21] text-white shadow-xs' : 'text-[#555869] hover:text-[#1a1b21]'
              }`}
            >
              Categorías
            </button>
          </div>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-4 h-10 rounded-full text-xs font-bold bg-white text-[#1a1b21] border border-black/10 hover:bg-black/5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#555869]" />
            <span>Exportar CSV</span>
          </button>

          {/* Botón Principal Agregar Producto */}
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 px-4.5 h-10 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-[#1a1b21]/20 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{copy.buttons.add}</span>
          </button>
        </div>
      </div>

      {/* ── 2. TARJETAS KPI DE RESUMEN ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Productos en carta
          </span>
          <span className="text-2xl font-bold text-[#1a1b21] numeral-clean">
            {totalItems} ítems
          </span>
          <span className="text-[11px] text-[#555869]">Cafetería y ludoteca</span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Valoración total
          </span>
          <span className="text-2xl font-bold text-[oklch(42%_0.16_145)] numeral-clean">
            S/ {totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#555869]">Precio × existencias</span>
        </div>

        <div className="living-card p-4 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555869]">
            Sin fotografía
          </span>
          <span className={`text-2xl font-bold numeral-clean ${missingPhotos > 0 ? 'text-[#b45309]' : 'text-[oklch(42%_0.16_145)]'}`}>
            {missingPhotos}
          </span>
          <span className="text-[11px] text-[#555869]">
            {missingPhotos > 0 ? 'Haz clic en la tarjeta para subir' : 'Todas con foto asignada ✓'}
          </span>
        </div>
      </div>

      {/* ── 3. VISTA PRINCIPAL: PRODUCTOS CON BARRA DE CONTROL ── */}
      {view === 'productos' && (
        <div className="flex flex-col gap-5">
          {/* BARRA DE HERRAMIENTAS Y FILTROS INTEGRADA */}
          <div className="living-card p-3.5 flex flex-col gap-3">
            {/* Fila 1: Píldoras de Categoría Principal */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['Todos', 'Alimentos y bebidas', 'Juegos de mesa', 'Sin foto', 'Bajo stock'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMainFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    mainFilter === cat
                      ? 'bg-[#1a1b21] text-white shadow-xs'
                      : 'bg-black/5 text-[#555869] hover:bg-black/10 hover:text-[#1a1b21]'
                  }`}
                >
                  {cat === 'Todos' ? copy.badges.all : cat === 'Sin foto' ? 'Sin foto' : cat === 'Bajo stock' ? copy.badges.low : cat}
                </button>
              ))}
            </div>

            {/* Fila 2: Subcategoría, Ordenar y Buscador con Alturas Homogéneas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-black/5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Selector de Sección */}
                <select
                  value={subCategoryFilter}
                  onChange={(e) => setSubCategoryFilter(e.target.value)}
                  className="living-select text-xs h-10 w-auto max-w-[200px]"
                >
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'Todas' ? 'Todas las secciones' : sub}
                    </option>
                  ))}
                </select>

                {/* Selector de Orden */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="living-select text-xs h-10 w-auto"
                >
                  <option value="nombre">Ordenar por: Nombre</option>
                  <option value="precio_desc">Mayor precio</option>
                  <option value="precio_asc">Menor precio</option>
                  <option value="stock">Menor stock</option>
                </select>
              </div>

              {/* Buscador Unificado con InputField */}
              <div className="w-full sm:w-72">
                <InputField
                  leftIcon={<Search className="w-4 h-4 text-[#555869]" />}
                  placeholder={copy.placeholders.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!h-10 !min-h-[40px] text-xs"
                />
              </div>
            </div>
          </div>

          {/* CUADRÍCULA DE PRODUCTOS */}
          {filtered.length === 0 ? (
            <div className="living-card p-14 flex flex-col items-center gap-3 text-center">
              <Package className="w-12 h-12 text-[#555869]/40" />
              <p className="font-bold text-[#1a1b21] text-base m-0">Sin productos</p>
              <p className="text-xs text-[#555869] max-w-sm m-0">
                No encontramos productos con los filtros seleccionados.
              </p>
              <button
                onClick={openNew}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 mt-2"
              >
                {copy.buttons.add}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((prod) => {
                const hasImage = Boolean(prod.image || prod.imageUrl)

                return (
                  <div
                    key={prod.id}
                    className="living-card flex flex-col overflow-hidden group hover:shadow-md transition-shadow border border-black/8 rounded-2xl bg-white"
                  >
                    {/* Contenedor de Fotografía con Relación 4:3 */}
                    <div className="relative w-full aspect-[4/3] bg-black/5 overflow-hidden">
                      {hasImage ? (
                        <img
                          src={prod.image || prod.imageUrl || ''}
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 bg-gradient-to-b from-black/[0.02] to-black/[0.06] text-center">
                          <div className="w-10 h-10 rounded-full bg-white shadow-2xs flex items-center justify-center text-[#555869]">
                            {prod.category === 'Juegos de mesa' ? (
                              <Package className="w-5 h-5 text-[#555869]" />
                            ) : (
                              <UtensilsCrossed className="w-5 h-5 text-[#555869]" />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-[#555869]">Sin foto</span>
                          <button
                            type="button"
                            onClick={() => openEdit(prod)}
                            className="flex items-center gap-1 text-[11px] font-bold text-[#1a1b21] bg-white px-3 py-1 rounded-full shadow-2xs hover:shadow-xs transition-shadow"
                          >
                            <Camera className="w-3 h-3 text-[#555869]" />
                            <span>Subir foto</span>
                          </button>
                        </div>
                      )}

                      {/* Insignia de Sección (Top-Left) */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-[#1a1b21] shadow-2xs backdrop-blur-xs">
                        {prod.subCategory || (prod.category === 'Juegos de mesa' ? 'Juegos' : 'Cafetería')}
                      </span>

                      {/* Insignia de Stock (Top-Right) */}
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs backdrop-blur-xs ${
                        prod.stock < 5
                          ? 'bg-[#fee2e2]/95 text-[#b91c1c]'
                          : 'bg-white/95 text-[oklch(42%_0.16_145)]'
                      }`}>
                        {prod.stock < 5 ? `Bajo (${prod.stock})` : `${prod.stock} uds.`}
                      </span>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1b21] leading-tight line-clamp-2 m-0" title={prod.name}>
                          {prod.name}
                        </h3>
                        <span className="text-[11px] text-[#555869] block mt-1 numeral-clean">
                          {prod.sku || 'ALM-001'}
                        </span>
                      </div>

                      {/* Fila de Precios y Acciones */}
                      <div className="pt-3 border-t border-black/6 flex flex-col gap-2.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-[#555869] font-medium">Precio</span>
                          <span className="text-xl font-black text-[#1a1b21] numeral-clean tracking-tight">
                            S/ {(Number(prod.price) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Botones de Acción con Alturas y Proporciones Limpias */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => openEdit(prod)}
                            className="flex-1 h-9 rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{copy.buttons.edit}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDelete(prod)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#b91c1c] bg-[#fee2e2]/50 hover:bg-[#fee2e2] transition-colors shrink-0"
                            title={copy.buttons.delete}
                            aria-label={copy.buttons.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── 4. VISTA DE CATEGORÍAS ── */}
      {view === 'categorias' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
              Categorías de Carta
            </h2>
            <span className="text-xs text-[#555869]">
              {availableCategories.length} categorías registradas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat || p.subCategory === cat).length
              const isEditing = editingCategory === cat

              return (
                <div key={cat} className="living-card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <input
                        value={categoryDraft}
                        onChange={(e) => setCategoryDraft(e.target.value)}
                        className="living-input text-sm font-bold flex-1 h-10"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-base font-bold text-[#1a1b21] m-0 truncate">{cat}</h3>
                    )}

                    <span className="text-xs font-semibold text-[#555869] bg-black/5 px-2.5 py-1 rounded-full shrink-0">
                      {count} items
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/6">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#555869] hover:bg-black/5"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={savingCategory}
                          onClick={() => handleSaveRenameCategory(cat)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90"
                        >
                          Guardar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartRenameCategory(cat)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-black/5 hover:bg-black/10 text-[#1a1b21]"
                        >
                          Renombrar
                        </button>
                        {onDeleteCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar la categoría "${cat}"?`)) {
                                onDeleteCategory(cat)
                              }
                            }}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#b91c1c] hover:bg-[#fee2e2]"
                          >
                            Eliminar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 5. MODAL CREAR / EDITAR PRODUCTO ── */}
      {modalOpen && (
        <OverlayPortal>
          <div ref={productModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="glass-card max-w-lg w-full !p-6 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-2 border-b border-black/8">
                <div>
                  <span className="eyebrow">PRODUCTO</span>
                  <h2 className="text-2xl font-bold font-cormorant text-[#1a1b21] m-0">
                    {editProduct ? copy.buttons.edit : copy.buttons.new}
                  </h2>
                  <p className="text-xs text-[#555869] mt-0.5 m-0">
                    Precio, stock y foto del producto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/8 text-[#555869]"
                  aria-label={copy.buttons.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
                {/* Zona de Fotografía */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#1a1b21]">{copy.labels.photo}</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-black/5 overflow-hidden border border-black/10 shrink-0 flex items-center justify-center relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-[#555869]/50" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="py-2.5 px-4 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Subiendo...' : copy.buttons.uploadPhoto}</span>
                      </button>
                      <span className="text-[10.5px] text-[#555869]">
                        {copy.helpers.photoRatio}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nombre Comercial */}
                <InputField
                  label={`${copy.labels.name} *`}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Waffle Especial con Nutella"
                  required
                />

                {/* Categoría y Sección */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-[#1a1b21]">{copy.labels.category}</label>
                    <select
                      className="living-select text-xs h-12"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Alimentos y bebidas">Alimentos y bebidas</option>
                      <option value="Juegos de mesa">Juegos de mesa</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <InputField
                      label={copy.labels.section}
                      type="text"
                      value={form.subCategory}
                      onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                      placeholder="WAFFLES, POSTRES..."
                    />
                  </div>
                </div>

                {/* Precios, Costo y Existencias */}
                <div className="grid grid-cols-3 gap-2">
                  <InputField
                    label={`${copy.labels.price} *`}
                    type="number"
                    step="0.10"
                    min="0"
                    prefixText="S/"
                    className="numeral-clean font-bold text-[oklch(42%_0.16_145)]"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder={copy.placeholders.price}
                    required
                  />

                  <InputField
                    label={copy.labels.cost}
                    type="number"
                    step="0.01"
                    min="0"
                    prefixText="S/"
                    className="numeral-clean"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder={copy.placeholders.cost}
                  />

                  <InputField
                    label={copy.labels.stock}
                    type="number"
                    min="0"
                    suffixText="uds."
                    className="numeral-clean font-bold"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="15"
                  />
                </div>

                {/* Código SKU */}
                <InputField
                  label={copy.labels.sku}
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder={copy.placeholders.sku}
                />

                {/* Botones de Acción del Modal */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/6 mt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-black/5 hover:bg-black/10 text-[#1a1b21]"
                  >
                    {copy.buttons.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#1a1b21] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : editProduct ? copy.buttons.save : copy.buttons.create}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </OverlayPortal>
      )}

      {/* ── 6. MODAL CONFIRMAR ELIMINAR ── */}
      {confirmDelete && (
        <OverlayPortal>
          <div ref={deleteModalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="glass-card max-w-sm w-full !p-6 flex flex-col gap-4 text-center animate-in zoom-in-95 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-cormorant text-[#1a1b21] m-0">
                  {copy.buttons.delete} {copy.labels.product}
                </h3>
                <p className="text-xs text-[#555869] mt-1 m-0">
                  {copy.confirm.deleteProduct(confirmDelete.name)}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-black/5 text-[#1a1b21] hover:bg-black/10"
                >
                  {copy.buttons.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#b91c1c] text-white hover:opacity-90"
                >
                  {copy.buttons.delete}
                </button>
              </div>
            </div>
          </div>
        </OverlayPortal>
      )}
    </div>
  )
}

export default CatalogoModule
